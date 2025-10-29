/**
 * Seed Ginger Disease Remedies Database
 * 
 * This script populates the database with comprehensive remedy data
 * for each ginger disease, including both organic and chemical treatments.
 */

const fs = require('fs');
const path = require('path');
const { Remedy } = require('../src/models');
const { sequelize } = require('../src/models');

// Load remedies data
const remediesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/ginger-remedies.json'), 'utf8')
);

/**
 * Format disease data for database insertion
 */
function formatDiseaseForDB(diseaseClass, diseaseInfo) {
  const severityMap = {
    'bacterial_wilt': 'critical',
    'rhizome_rot': 'high',
    'soft_rot': 'high',
    'yellow_disease': 'high',
    'leaf_spot': 'medium',
    'root_knot_nematode': 'high',
    'healthy': 'low'
  };

  // Format treatments array
  const treatments = [];
  
  // Add organic remedies
  if (diseaseInfo.organic_remedies) {
    diseaseInfo.organic_remedies.forEach(remedy => {
      treatments.push({
        name: remedy.name,
        type: 'organic',
        description: remedy.description,
        application: remedy.application,
        effectiveness: remedy.effectiveness,
        cost: remedy.cost,
        timing: remedy.timing
      });
    });
  }

  // Add chemical remedies
  if (diseaseInfo.chemical_remedies) {
    diseaseInfo.chemical_remedies.forEach(remedy => {
      treatments.push({
        name: remedy.name,
        type: 'chemical',
        description: remedy.description,
        application: remedy.application,
        effectiveness: remedy.effectiveness,
        cost: remedy.cost,
        timing: remedy.timing,
        safetyPrecautions: remedy.safety_precautions || ''
      });
    });
  }

  return {
    diseaseName: diseaseInfo.disease_name,
    diseaseCode: diseaseClass.toUpperCase(),
    description: diseaseInfo.description,
    symptoms: diseaseInfo.symptoms || [],
    causes: [], // Will be populated separately if needed
    treatments: treatments,
    preventionMeasures: diseaseInfo.prevention_measures || [],
    severity: severityMap[diseaseClass] || 'medium',
    imageUrl: null,
    isActive: true,
    version: 1
  };
}

/**
 * Seed all remedies into database
 */
async function seedRemedies() {
  try {
    console.log('🌱 Starting remedy database seeding...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Clear existing remedies (optional - comment out if you want to keep existing)
    const existingCount = await Remedy.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing remedies`);
      console.log('📝 Clearing existing remedies...');
      await Remedy.destroy({ where: {}, force: true });
      console.log('✅ Existing remedies cleared\n');
    }

    let totalCreated = 0;

    // Process each disease
    for (const [diseaseClass, diseaseInfo] of Object.entries(remediesData)) {
      console.log(`\n📋 Processing ${diseaseInfo.disease_name}...`);
      
      const remedyData = formatDiseaseForDB(diseaseClass, diseaseInfo);
      
      await Remedy.create(remedyData);
      totalCreated++;
      
      const organicCount = diseaseInfo.organic_remedies ? diseaseInfo.organic_remedies.length : 0;
      const chemicalCount = diseaseInfo.chemical_remedies ? diseaseInfo.chemical_remedies.length : 0;
      
      console.log(`  ✅ Created remedy entry with ${organicCount} organic + ${chemicalCount} chemical treatments`);
    }

    console.log(`\n🎉 Successfully seeded ${totalCreated} disease remedies into database!`);
    console.log('\n📊 Summary by disease:');
    
    // Get summary statistics
    const allRemedies = await Remedy.findAll({
      attributes: ['diseaseName', 'diseaseCode', 'treatments', 'severity']
    });
    
    for (const remedy of allRemedies) {
      const treatments = remedy.treatments || [];
      const organicCount = treatments.filter(t => t.type === 'organic').length;
      const chemicalCount = treatments.filter(t => t.type === 'chemical').length;
      
      console.log(`  ${remedy.diseaseName} (${remedy.diseaseCode}):`);
      console.log(`    - Severity: ${remedy.severity}`);
      console.log(`    - Organic treatments: ${organicCount}`);
      console.log(`    - Chemical treatments: ${chemicalCount}`);
      console.log(`    - Total: ${treatments.length}`);
    }

    console.log('\n✨ Remedy seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Error seeding remedies:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

/**
 * Run the seeding script
 */
if (require.main === module) {
  seedRemedies()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { seedRemedies, formatDiseaseForDB };
