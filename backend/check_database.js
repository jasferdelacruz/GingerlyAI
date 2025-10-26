#!/usr/bin/env node

/**
 * Database Integrity Check Script
 * Checks for duplicates, orphaned records, and data integrity issues
 */

const { sequelize } = require('./src/config/database');
const { User, Prediction, Remedy, Model, RefreshToken } = require('./src/models');

async function checkDatabase() {
  console.log('🔍 Checking Database Setup and Integrity...');
  console.log('=' * 60);
  
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check tables exist
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📊 Tables found:', tables.length);
    tables.forEach(table => console.log(`  - ${table}`));
    
    // Check for duplicates in each table
    console.log('\n🔍 Checking for duplicates...');
    console.log('-'.repeat(40));
    
    // Check Users table
    const userCount = await User.count();
    console.log(`👥 Users: ${userCount} total`);
    
    const duplicateEmails = await sequelize.query(
      'SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING COUNT(*) > 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (duplicateEmails.length > 0) {
      console.log('❌ Duplicate emails found:');
      duplicateEmails.forEach(dup => {
        console.log(`  - ${dup.email}: ${dup.count} occurrences`);
      });
    } else {
      console.log('✅ No duplicate emails');
    }
    
    // Check RefreshTokens table
    const tokenCount = await RefreshToken.count();
    console.log(`\n🔑 Refresh Tokens: ${tokenCount} total`);
    
    const duplicateTokens = await sequelize.query(
      'SELECT token, COUNT(*) as count FROM refresh_tokens GROUP BY token HAVING COUNT(*) > 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (duplicateTokens.length > 0) {
      console.log('❌ Duplicate tokens found:');
      duplicateTokens.forEach(dup => {
        console.log(`  - Token: ${dup.token.substring(0, 20)}... (${dup.count} occurrences)`);
      });
    } else {
      console.log('✅ No duplicate tokens');
    }
    
    // Check Predictions table
    const predictionCount = await Prediction.count();
    console.log(`\n🔮 Predictions: ${predictionCount} total`);
    
    // Check Remedies table
    const remedyCount = await Remedy.count();
    console.log(`\n💊 Remedies: ${remedyCount} total`);
    
    const duplicateDiseaseCodes = await sequelize.query(
      'SELECT "diseaseCode", COUNT(*) as count FROM remedies GROUP BY "diseaseCode" HAVING COUNT(*) > 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (duplicateDiseaseCodes.length > 0) {
      console.log('❌ Duplicate disease codes found:');
      duplicateDiseaseCodes.forEach(dup => {
        console.log(`  - ${dup.diseaseCode}: ${dup.count} occurrences`);
      });
    } else {
      console.log('✅ No duplicate disease codes');
    }
    
    // Check Models table
    const modelCount = await Model.count();
    console.log(`\n🤖 Models: ${modelCount} total`);
    
    const duplicateModelNames = await sequelize.query(
      'SELECT name, version, COUNT(*) as count FROM models GROUP BY name, version HAVING COUNT(*) > 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (duplicateModelNames.length > 0) {
      console.log('❌ Duplicate model names/versions found:');
      duplicateModelNames.forEach(dup => {
        console.log(`  - ${dup.name} v${dup.version}: ${dup.count} occurrences`);
      });
    } else {
      console.log('✅ No duplicate model names/versions');
    }
    
    // Check foreign key references
    console.log('\n🔗 Checking foreign key references...');
    console.log('-'.repeat(40));
    
    // Check orphaned predictions
    const orphanedPredictions = await sequelize.query(
      'SELECT p.id FROM predictions p LEFT JOIN users u ON p."userId" = u.id WHERE u.id IS NULL',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (orphanedPredictions.length > 0) {
      console.log(`❌ Orphaned predictions found: ${orphanedPredictions.length}`);
      console.log('  These predictions reference non-existent users');
    } else {
      console.log('✅ No orphaned predictions');
    }
    
    // Check orphaned refresh tokens
    const orphanedTokens = await sequelize.query(
      'SELECT rt.id FROM refresh_tokens rt LEFT JOIN users u ON rt."userId" = u.id WHERE u.id IS NULL',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (orphanedTokens.length > 0) {
      console.log(`❌ Orphaned refresh tokens found: ${orphanedTokens.length}`);
      console.log('  These tokens reference non-existent users');
    } else {
      console.log('✅ No orphaned refresh tokens');
    }
    
    // Check predictions with invalid remedy references
    const invalidRemedyRefs = await sequelize.query(
      'SELECT p.id FROM predictions p LEFT JOIN remedies r ON p."remedyId" = r.id WHERE p."remedyId" IS NOT NULL AND r.id IS NULL',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (invalidRemedyRefs.length > 0) {
      console.log(`❌ Predictions with invalid remedy references: ${invalidRemedyRefs.length}`);
      console.log('  These predictions reference non-existent remedies');
    } else {
      console.log('✅ No invalid remedy references');
    }
    
    // Check predictions with invalid model references
    const invalidModelRefs = await sequelize.query(
      'SELECT p.id FROM predictions p LEFT JOIN models m ON p."modelId" = m.id WHERE m.id IS NULL',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (invalidModelRefs.length > 0) {
      console.log(`❌ Predictions with invalid model references: ${invalidModelRefs.length}`);
      console.log('  These predictions reference non-existent models');
    } else {
      console.log('✅ No invalid model references');
    }
    
    // Check data consistency
    console.log('\n📊 Data consistency checks...');
    console.log('-'.repeat(40));
    
    // Check for users with invalid roles
    const invalidRoles = await sequelize.query(
      'SELECT id, email, role FROM users WHERE role NOT IN (\'user\', \'admin\')',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (invalidRoles.length > 0) {
      console.log('❌ Users with invalid roles:');
      invalidRoles.forEach(user => {
        console.log(`  - ${user.email}: ${user.role}`);
      });
    } else {
      console.log('✅ All users have valid roles');
    }
    
    // Check for expired refresh tokens (SQLite compatible)
    const expiredTokens = await sequelize.query(
      'SELECT COUNT(*) as count FROM refresh_tokens WHERE "expiresAt" < datetime("now") AND "isRevoked" = false',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (expiredTokens[0].count > 0) {
      console.log(`⚠️  Expired but not revoked tokens: ${expiredTokens[0].count}`);
      console.log('  Consider cleaning up expired tokens');
    } else {
      console.log('✅ No expired unrevoked tokens');
    }
    
    // Summary
    console.log('\n📋 SUMMARY');
    console.log('=' * 60);
    console.log(`Total Users: ${userCount}`);
    console.log(`Total Refresh Tokens: ${tokenCount}`);
    console.log(`Total Predictions: ${predictionCount}`);
    console.log(`Total Remedies: ${remedyCount}`);
    console.log(`Total Models: ${modelCount}`);
    
    const totalIssues = duplicateEmails.length + duplicateTokens.length + 
                       duplicateDiseaseCodes.length + duplicateModelNames.length +
                       orphanedPredictions.length + orphanedTokens.length +
                       invalidRemedyRefs.length + invalidModelRefs.length +
                       invalidRoles.length;
    
    if (totalIssues === 0) {
      console.log('\n🎉 Database integrity check PASSED!');
      console.log('✅ No duplicates or invalid references found');
    } else {
      console.log(`\n⚠️  Database integrity check found ${totalIssues} issues`);
      console.log('❌ Please review and fix the issues above');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkDatabase().catch(console.error);
