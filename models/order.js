const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId : {
    type: mongoose.Schema.Types.ObjectId,
    required : true,
    ref : 'User'
  },
  products : [{
    productId : {
      ref: 'Product',
      type: mongoose.SchemaTypes.ObjectId,
      required : true
    },
    quantity :{
      type : mongoose.SchemaTypes.Number,
      required: true
    }
  }]
});

module.exports = mongoose.model('Order', orderSchema);



// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const Order = sequelize.define('order', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   }
// });
// module.exports = Order;
