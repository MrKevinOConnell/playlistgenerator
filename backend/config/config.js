require('dotenv').config(); // this is important!
module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NAME,
    host: process.env.HOST,
    dialect: 'postgres',
    seederStorage: 'sequelize',
  },
  test: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NAME,
    host: process.env.HOST,
    dialect: 'postgres',
    seederStorage: 'sequelize',
  },
   production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    protocol: "postgres",
    dialectOptions: { ssl: {require: true, rejectUnauthorized: false } },
  },
}
