#!/usr/bin/env node

/**
 * Database Schema Check Script
 * Verifies table structure, constraints, and relationships
 */

const { sequelize } = require('./src/config/database');

async function checkSchema() {
  console.log('🔍 Checking Database Schema...');
  console.log('=' * 50);
  
  try {
    // Get table information
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`📊 Found ${tables.length} tables: ${tables.join(', ')}`);
    
    for (const table of tables) {
      console.log(`\n📋 Table: ${table}`);
      console.log('-'.repeat(40));
      
      // Get column information
      const columns = await sequelize.getQueryInterface().describeTable(table);
      console.log('Columns:');
      Object.entries(columns).forEach(([name, info]) => {
        const nullable = info.allowNull ? 'NULL' : 'NOT NULL';
        const unique = info.unique ? ' UNIQUE' : '';
        const primary = info.primaryKey ? ' PRIMARY KEY' : '';
        const defaultValue = info.defaultValue !== undefined ? ` DEFAULT ${info.defaultValue}` : '';
        console.log(`  ${name}: ${info.type}${nullable}${unique}${primary}${defaultValue}`);
      });
      
      // Get indexes
      const indexes = await sequelize.getQueryInterface().showIndex(table);
      if (indexes.length > 0) {
        console.log('\nIndexes:');
        indexes.forEach(idx => {
          const unique = idx.unique ? ' (UNIQUE)' : '';
          const fields = idx.fields.map(f => f.attribute).join(', ');
          console.log(`  - ${idx.name}: ${fields}${unique}`);
        });
      }
    }
    
    // Check specific constraints
    console.log('\n🔗 Constraint Verification:');
    console.log('-'.repeat(40));
    
    // Check Users table constraints
    const userConstraints = await sequelize.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='users'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (userConstraints.length > 0) {
      console.log('Users table constraints:');
      console.log(`  ${userConstraints[0].sql}`);
    }
    
    // Check RefreshTokens table constraints
    const tokenConstraints = await sequelize.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='refresh_tokens'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (tokenConstraints.length > 0) {
      console.log('\nRefreshTokens table constraints:');
      console.log(`  ${tokenConstraints[0].sql}`);
    }
    
    // Check for foreign key constraints
    console.log('\n🔗 Foreign Key Relationships:');
    console.log('-'.repeat(40));
    
    const fkQuery = `
      SELECT 
        m.name as table_name,
        p.name as column_name,
        p.type as column_type,
        p."notnull" as not_null,
        p."pk" as primary_key
      FROM sqlite_master m
      LEFT JOIN pragma_table_info(m.name) p ON m.name = p.name
      WHERE m.type = 'table' AND m.name != 'sqlite_sequence'
      ORDER BY m.name, p.cid
    `;
    
    const fkInfo = await sequelize.query(fkQuery, { type: sequelize.QueryTypes.SELECT });
    
    // Group by table
    const tableInfo = {};
    fkInfo.forEach(row => {
      if (!tableInfo[row.table_name]) {
        tableInfo[row.table_name] = [];
      }
      tableInfo[row.table_name].push(row);
    });
    
    Object.entries(tableInfo).forEach(([table, columns]) => {
      console.log(`\n${table}:`);
      columns.forEach(col => {
        const nullable = col.not_null ? 'NOT NULL' : 'NULL';
        const primary = col.primary_key ? ' PRIMARY KEY' : '';
        console.log(`  ${col.column_name}: ${col.column_type} ${nullable}${primary}`);
      });
    });
    
    // Check data types consistency
    console.log('\n📊 Data Type Consistency:');
    console.log('-'.repeat(40));
    
    // Check UUID fields
    const uuidFields = await sequelize.query(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='table' AND sql LIKE '%UUID%'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (uuidFields.length > 0) {
      console.log('UUID fields found:');
      uuidFields.forEach(field => {
        console.log(`  ${field.name}: ${field.sql}`);
      });
    }
    
    // Check JSON fields
    const jsonFields = await sequelize.query(`
      SELECT name, sql FROM sqlite_master 
      WHERE type='table' AND sql LIKE '%JSON%'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (jsonFields.length > 0) {
      console.log('\nJSON fields found:');
      jsonFields.forEach(field => {
        console.log(`  ${field.name}: ${field.sql}`);
      });
    }
    
    console.log('\n✅ Schema check completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Run the schema check
checkSchema().catch(console.error);
