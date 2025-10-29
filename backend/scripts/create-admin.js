/**
 * Create Admin User Script
 */

const { User } = require('../src/models');
const { sequelize } = require('../src/models');

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...\n');

    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@gingerlyai.com' } 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email: admin@gingerlyai.com');
      console.log('Password: Admin123!');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@gingerlyai.com',
      password: 'Admin123!',
      role: 'admin',
      phone: '+639123450000',
      location: 'Villaverde, Nueva Vizcaya',
      farmSize: null,
      isActive: true
    });

    console.log('🎉 Admin user created successfully!\n');
    console.log('📧 Email: admin@gingerlyai.com');
    console.log('🔑 Password: Admin123!\n');
    console.log('⚠️  IMPORTANT: Change this password in production!\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { createAdmin };

