'use strict'
module.exports = (sequelize, DataTypes) => {
  const room = sequelize.define(
    'room',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      code: DataTypes.STRING,
      users: DataTypes.ARRAY(DataTypes.JSON),
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      underscored: true,
      tableName: 'Rooms'
    }
  )
  return room
}
