const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodecomplete', 'root', 'toor', {
  dialect: 'mysql',
  host: '192.168.99.100'
});

module.exports = sequelize;
