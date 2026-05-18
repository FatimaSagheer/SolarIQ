const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected');
  } catch (err) {
    console.error('❌ PostgreSQL Error:', err.message);
  }
};

module.exports = { sequelize, connectPostgres };