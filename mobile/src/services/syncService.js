import { apiService } from './apiService';
import { databaseService } from './databaseService';
import { Network } from '@capacitor/network';

class SyncService {
  async isOnline() {
    const status = await Network.getStatus();
    return status.connected;
  }

  async syncPredictions() {
    try {
      const isConnected = await this.isOnline();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection available',
        };
      }

      // Get current user ID
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          message: 'User not authenticated',
        };
      }

      // Get unsynced predictions
      const unsyncedPredictions = await databaseService.getUnsyncedPredictions(userId);
      
      if (unsyncedPredictions.length === 0) {
        return {
          success: true,
          message: 'No predictions to sync',
          syncedCount: 0,
        };
      }

      // Prepare predictions for sync
      const predictionsToSync = unsyncedPredictions.map(prediction => ({
        id: prediction.id,
        remedyId: prediction.remedyId,
        modelId: prediction.modelId,
        imageUrl: prediction.imageUrl,
        predictionResults: prediction.predictionResults,
        topPrediction: prediction.topPrediction,
        confidence: prediction.confidence,
        isOfflinePrediction: prediction.isOfflinePrediction,
        deviceInfo: prediction.deviceInfo,
        location: prediction.location,
        notes: prediction.notes,
        createdAt: prediction.createdAt,
      }));

      // Sync with backend
      const response = await apiService.post('/predictions/sync', {
        predictions: predictionsToSync,
      });

      // Process sync results
      const successfulSyncs = response.results.filter(result => result.status === 'success');
      const syncedIds = successfulSyncs.map(result => result.clientId);

      // Mark successfully synced predictions
      if (syncedIds.length > 0) {
        await databaseService.markPredictionsSynced(syncedIds);
      }

      return {
        success: true,
        message: 'Predictions synced successfully',
        syncedCount: syncedIds.length,
        errorCount: response.results.length - syncedIds.length,
      };
    } catch (error) {
      console.error('Prediction sync failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to sync predictions',
      };
    }
  }

  async syncRemedies() {
    try {
      const isConnected = await this.isOnline();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection available',
        };
      }

      // Get last sync time for remedies
      const lastSyncTime = await databaseService.getSetting('last_remedy_sync');

      // Fetch updated remedies from backend
      const params = {};
      if (lastSyncTime) {
        params.lastSyncTime = lastSyncTime;
      }

      const response = await apiService.get('/remedies/sync', params);

      if (response.remedies && response.remedies.length > 0) {
        // Convert API remedies to local format
        const localRemedies = response.remedies.map(remedy => ({
          id: remedy.id,
          diseaseName: remedy.diseaseName,
          diseaseCode: remedy.diseaseCode,
          description: remedy.description,
          symptoms: remedy.symptoms || [],
          causes: remedy.causes || [],
          treatments: remedy.treatments || [],
          preventionMeasures: remedy.preventionMeasures || [],
          severity: remedy.severity,
          imageUrl: remedy.imageUrl,
          version: remedy.version,
          updatedAt: remedy.updatedAt,
        }));

        // Save remedies to local database
        await databaseService.saveRemedies(localRemedies);

        // Update last sync time
        await databaseService.setSetting('last_remedy_sync', response.syncTime);

        return {
          success: true,
          message: 'Remedies synced successfully',
          syncedCount: localRemedies.length,
        };
      } else {
        return {
          success: true,
          message: 'No new remedies to sync',
          syncedCount: 0,
        };
      }
    } catch (error) {
      console.error('Remedy sync failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to sync remedies',
      };
    }
  }

  async checkModelUpdates() {
    try {
      const isConnected = await this.isOnline();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection available',
        };
      }

      // Get current active model
      const currentModel = await databaseService.getActiveModel();
      
      // Check for updates
      const params = {};
      if (currentModel) {
        params.currentVersion = currentModel.version;
        params.modelName = currentModel.name;
      }

      const response = await apiService.get('/models/updates', params);

      if (response.updateAvailable && response.currentModel) {
        // New model version available
        const newModel = response.currentModel;
        
        // Save model metadata (actual download would be handled separately)
        const localModel = {
          id: newModel.id,
          name: newModel.name,
          version: newModel.version,
          description: newModel.description,
          modelPath: newModel.downloadUrl || '', // This would be local path after download
          inputShape: newModel.inputShape,
          outputClasses: newModel.outputClasses,
          accuracy: newModel.accuracy,
          isActive: newModel.isActive,
          isDefault: newModel.isDefault,
          downloadUrl: newModel.downloadUrl,
          checksum: newModel.checksum,
          updatedAt: newModel.updatedAt,
        };

        await databaseService.saveModel(localModel);

        return {
          success: true,
          message: 'Model update available',
          syncedCount: 1,
        };
      } else {
        return {
          success: true,
          message: 'Model is up to date',
          syncedCount: 0,
        };
      }
    } catch (error) {
      console.error('Model update check failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to check for model updates',
      };
    }
  }

  async downloadModel(modelId) {
    try {
      const isConnected = await this.isOnline();
      if (!isConnected) {
        return {
          success: false,
          message: 'No internet connection available',
        };
      }

      // Download model file
      const modelBlob = await apiService.downloadFile(`/models/${modelId}/download`);
      
      // Save to local storage (this is simplified - in reality you'd save to filesystem)
      const modelUrl = URL.createObjectURL(modelBlob);
      
      return {
        success: true,
        message: 'Model downloaded successfully',
        syncedCount: 1,
      };
    } catch (error) {
      console.error('Model download failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to download model',
      };
    }
  }

  async fullSync() {
    const results = {
      predictions: await this.syncPredictions(),
      remedies: await this.syncRemedies(),
      models: await this.checkModelUpdates(),
      overall: { success: true, message: 'Sync completed' },
    };

    // Determine overall success
    const allSuccessful = results.predictions.success && results.remedies.success && results.models.success;
    
    if (!allSuccessful) {
      results.overall = {
        success: false,
        message: 'Some sync operations failed',
      };
    }

    return results;
  }

  async getCurrentUserId() {
    // Get the user ID from local storage or preferences
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value: userJson } = await Preferences.get({ key: 'user' });
      
      if (userJson) {
        const user = JSON.parse(userJson);
        return user.id;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get current user ID:', error);
      return null;
    }
  }

  // Utility method to check sync status
  async getSyncStatus() {
    const userId = await this.getCurrentUserId();
    const isOnline = await this.isOnline();
    
    let pendingPredictions = 0;
    if (userId) {
      const unsynced = await databaseService.getUnsyncedPredictions(userId);
      pendingPredictions = unsynced.length;
    }

    const lastSyncTimeStr = await databaseService.getSetting('last_full_sync');
    const lastSyncTime = lastSyncTimeStr ? new Date(lastSyncTimeStr) : null;

    return {
      lastSyncTime,
      pendingPredictions,
      isOnline,
    };
  }

  // Mark successful full sync
  async markFullSyncComplete() {
    await databaseService.setSetting('last_full_sync', new Date().toISOString());
  }
}

export const syncService = new SyncService();
