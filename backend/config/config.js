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
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.NAME,
    host: process.env.HOST,
    dialect: 'postgres',
    dialectOptions: { ssl: true },
    seederStorage: 'sequelize',
  },
}
