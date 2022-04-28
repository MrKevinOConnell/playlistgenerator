'use strict';

const { sequelize } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Rooms', {
       id: {
        type: Sequelize.STRING,
      },
      code: {
        type: Sequelize.STRING,
      },
      users: {
        type: Sequelize.ARRAY(Sequelize.JSON)
      },
     created_at: {
       allowNull: false,
       type: Sequelize.DATE,
     },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Rooms');
  },
}
