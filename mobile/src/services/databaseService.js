import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

class DatabaseService {
  constructor() {
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if platform supports SQLite
      const platform = Capacitor.getPlatform();
      console.log(`🔧 Initializing database for platform: ${platform}`);
      
      if (platform === 'web') {
        // For web, we'll use browser SQLite
        try {
          await this.sqliteConnection.initWebStore();
          console.log('✅ Web store initialized');
        } catch (error) {
          console.warn('⚠️ Web store init failed, continuing anyway:', error.message);
        }
      }

      // Create/open database
      this.db = await this.sqliteConnection.createConnection(
        'gingerlyai_db',
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();
      console.log('✅ Database connection opened');
      
      await this.createTables();
      console.log('✅ Database tables created');
      
      this.isInitialized = true;
      console.log('✅ Local database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      console.warn('⚠️ App will continue with limited offline functionality');
      // Don't throw - allow app to continue without database
      this.isInitialized = false;
    }
  }

  async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    const queries = [
      // Predictions table
      `CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        remedyId TEXT,
        modelId TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        predictionResults TEXT NOT NULL,
        topPrediction TEXT NOT NULL,
        confidence REAL NOT NULL,
        isOfflinePrediction INTEGER DEFAULT 1,
        deviceInfo TEXT,
        location TEXT,
        notes TEXT,
        synced INTEGER DEFAULT 0,
        syncedAt TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`,

      // Remedies table
      `CREATE TABLE IF NOT EXISTS remedies (
        id TEXT PRIMARY KEY,
        diseaseName TEXT NOT NULL,
        diseaseCode TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        causes TEXT,
        treatments TEXT NOT NULL,
        preventionMeasures TEXT,
        severity TEXT NOT NULL,
        imageUrl TEXT,
        version INTEGER DEFAULT 1,
        updatedAt TEXT NOT NULL
      )`,

      // Models table
      `CREATE TABLE IF NOT EXISTS models (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        description TEXT,
        modelPath TEXT NOT NULL,
        inputShape TEXT NOT NULL,
        outputClasses TEXT NOT NULL,
        accuracy REAL,
        isActive INTEGER DEFAULT 0,
        isDefault INTEGER DEFAULT 0,
        downloadUrl TEXT,
        checksum TEXT,
        updatedAt TEXT NOT NULL
      )`,

      // App settings table
      `CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )`
    ];

    for (const query of queries) {
      await this.db.execute(query);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_predictions_userId ON predictions(userId)',
      'CREATE INDEX IF NOT EXISTS idx_predictions_synced ON predictions(synced)',
      'CREATE INDEX IF NOT EXISTS idx_predictions_createdAt ON predictions(createdAt)',
      'CREATE INDEX IF NOT EXISTS idx_remedies_diseaseCode ON remedies(diseaseCode)',
      'CREATE INDEX IF NOT EXISTS idx_models_active ON models(isActive)',
    ];

    for (const index of indexes) {
      await this.db.execute(index);
    }
  }

  // Predictions CRUD operations
  async savePrediction(prediction) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `INSERT OR REPLACE INTO predictions (
      id, userId, remedyId, modelId, imageUrl, predictionResults, topPrediction,
      confidence, isOfflinePrediction, deviceInfo, location, notes, synced, syncedAt,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      prediction.id,
      prediction.userId,
      prediction.remedyId || null,
      prediction.modelId,
      prediction.imageUrl,
      JSON.stringify(prediction.predictionResults),
      prediction.topPrediction,
      prediction.confidence,
      prediction.isOfflinePrediction ? 1 : 0,
      prediction.deviceInfo ? JSON.stringify(prediction.deviceInfo) : null,
      prediction.location ? JSON.stringify(prediction.location) : null,
      prediction.notes || null,
      prediction.synced ? 1 : 0,
      prediction.syncedAt || null,
      prediction.createdAt,
      prediction.updatedAt,
    ];

    await this.db.execute(query, values);
  }

  async getPredictions(userId, limit, offset) {
    if (!this.db) throw new Error('Database not initialized');

    let query = `SELECT * FROM predictions WHERE userId = ? ORDER BY createdAt DESC`;
    const values = [userId];

    if (limit) {
      query += ` LIMIT ?`;
      values.push(limit);
      
      if (offset) {
        query += ` OFFSET ?`;
        values.push(offset);
      }
    }

    const result = await this.db.query(query, values);
    
    return result.values?.map(this.mapPredictionFromDb) || [];
  }

  async getUnsyncedPredictions(userId) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `SELECT * FROM predictions WHERE userId = ? AND synced = 0 ORDER BY createdAt ASC`;
    const result = await this.db.query(query, [userId]);
    
    return result.values?.map(this.mapPredictionFromDb) || [];
  }

  async markPredictionsSynced(predictionIds) {
    if (!this.db || predictionIds.length === 0) return;

    const placeholders = predictionIds.map(() => '?').join(',');
    const query = `UPDATE predictions SET synced = 1, syncedAt = ? WHERE id IN (${placeholders})`;
    const values = [new Date().toISOString(), ...predictionIds];

    await this.db.execute(query, values);
  }

  mapPredictionFromDb = (row) => ({
    id: row.id,
    userId: row.userId,
    remedyId: row.remedyId,
    modelId: row.modelId,
    imageUrl: row.imageUrl,
    predictionResults: JSON.parse(row.predictionResults),
    topPrediction: row.topPrediction,
    confidence: row.confidence,
    isOfflinePrediction: Boolean(row.isOfflinePrediction),
    deviceInfo: row.deviceInfo ? JSON.parse(row.deviceInfo) : undefined,
    location: row.location ? JSON.parse(row.location) : undefined,
    notes: row.notes,
    synced: Boolean(row.synced),
    syncedAt: row.syncedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

  // Remedies CRUD operations
  async saveRemedies(remedies) {
    if (!this.db || remedies.length === 0) return;

    const query = `INSERT OR REPLACE INTO remedies (
      id, diseaseName, diseaseCode, description, symptoms, causes, treatments,
      preventionMeasures, severity, imageUrl, version, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    for (const remedy of remedies) {
      const values = [
        remedy.id,
        remedy.diseaseName,
        remedy.diseaseCode,
        remedy.description,
        JSON.stringify(remedy.symptoms),
        JSON.stringify(remedy.causes),
        JSON.stringify(remedy.treatments),
        JSON.stringify(remedy.preventionMeasures),
        remedy.severity,
        remedy.imageUrl || null,
        remedy.version,
        remedy.updatedAt,
      ];

      await this.db.execute(query, values);
    }
  }

  async getRemedies() {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM remedies ORDER BY diseaseName ASC');
    
    return result.values?.map(this.mapRemedyFromDb) || [];
  }

  async getRemedyByCode(diseaseCode) {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM remedies WHERE diseaseCode = ?', [diseaseCode]);
    
    if (result.values && result.values.length > 0) {
      return this.mapRemedyFromDb(result.values[0]);
    }
    
    return null;
  }

  mapRemedyFromDb = (row) => ({
    id: row.id,
    diseaseName: row.diseaseName,
    diseaseCode: row.diseaseCode,
    description: row.description,
    symptoms: JSON.parse(row.symptoms),
    causes: JSON.parse(row.causes || '[]'),
    treatments: JSON.parse(row.treatments),
    preventionMeasures: JSON.parse(row.preventionMeasures || '[]'),
    severity: row.severity,
    imageUrl: row.imageUrl,
    version: row.version,
    updatedAt: row.updatedAt,
  });

  // Models CRUD operations
  async saveModel(model) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `INSERT OR REPLACE INTO models (
      id, name, version, description, modelPath, inputShape, outputClasses,
      accuracy, isActive, isDefault, downloadUrl, checksum, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      model.id,
      model.name,
      model.version,
      model.description || null,
      model.modelPath,
      JSON.stringify(model.inputShape),
      JSON.stringify(model.outputClasses),
      model.accuracy || null,
      model.isActive ? 1 : 0,
      model.isDefault ? 1 : 0,
      model.downloadUrl || null,
      model.checksum || null,
      model.updatedAt,
    ];

    await this.db.execute(query, values);
  }

  async getActiveModel() {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM models WHERE isActive = 1 ORDER BY updatedAt DESC LIMIT 1');
    
    if (result.values && result.values.length > 0) {
      return this.mapModelFromDb(result.values[0]);
    }
    
    return null;
  }

  async getDefaultModel() {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT * FROM models WHERE isDefault = 1 LIMIT 1');
    
    if (result.values && result.values.length > 0) {
      return this.mapModelFromDb(result.values[0]);
    }
    
    return null;
  }

  mapModelFromDb = (row) => ({
    id: row.id,
    name: row.name,
    version: row.version,
    description: row.description,
    modelPath: row.modelPath,
    inputShape: JSON.parse(row.inputShape),
    outputClasses: JSON.parse(row.outputClasses),
    accuracy: row.accuracy,
    isActive: Boolean(row.isActive),
    isDefault: Boolean(row.isDefault),
    downloadUrl: row.downloadUrl,
    checksum: row.checksum,
    updatedAt: row.updatedAt,
  });

  // App settings
  async setSetting(key, value) {
    if (!this.db) throw new Error('Database not initialized');

    const query = `INSERT OR REPLACE INTO app_settings (key, value, updatedAt) VALUES (?, ?, ?)`;
    await this.db.execute(query, [key, value, new Date().toISOString()]);
  }

  async getSetting(key) {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.query('SELECT value FROM app_settings WHERE key = ?', [key]);
    
    if (result.values && result.values.length > 0) {
      return result.values[0].value;
    }
    
    return null;
  }

  // Database maintenance
  async clearUserData(userId) {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execute('DELETE FROM predictions WHERE userId = ?', [userId]);
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export const databaseService = new DatabaseService();
