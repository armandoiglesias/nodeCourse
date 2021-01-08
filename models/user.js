const mongoose = require('mongoose');

const Order = require('../models/order');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});

userSchema.methods.addToCart = function (product) {
  let newQuantity = 1;
  //this.cart = null;
  if (this.cart == null) {
    this.cart = {
      items: []
    };
  }
  const updatedCartItems = [...this.cart.items];
  const cartProductIndex = this.cart.items.findIndex(cp => {
    console.log(cp.productId, " ", product._id)
    return cp.productId.toString() === product._id.toString()
  });

  if (cartProductIndex != -1) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }

  const updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;
  return this.save();

}

userSchema.methods.getCart = function () {

  return this
    .populate('cart.items.productId')
    .execPopulate();
}

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.addOrder = function () {

  return this.getCart().then(user => {
    let products = user.cart.items.map(x => {
      return {
        quantity: x.quantity,
        productId: x.productId._id
      };
    });

    return new Order({
      userId: user._id,
      products: products
    }).save();

  }).then(result => {
    //console.log(result);
    this.cart = {
      items: []
    };

    return this.save();
  }).catch(err => console.log(err));

}

userSchema.methods.getOrders = function () {
  return  Order
    .find({ "userId" : this.id }).populate("products.productId");
}

module.exports = mongoose.model('User', userSchema);


// const getDb = require('../util/database').getDb;
// const mongoDb = require('mongodb');

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this.id = id
//   }

//   save() {
//     const db = getDb();
//     return db.collection('users').insertOne(this);
//   }

//   getCart() {
//     const db = getDb();

//     const productsId = this.cart.items.map(i => i.productId)

//     return db.collection('products').find({
//       _id: {
//         $in: productsId
//       }
//     }).toArray()
//       .then(products => {
//         return products.map(p => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(i => {
//               return i.productId.toString() === p._id.toString()
//             }).quantity
//           };
//         });
//       });

//   }


//   removeFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(item => {
//       return item.productId.toString() !== productId.toString();
//     });
//     const db = getDb();
//     return db.collection('users').updateOne({
//       _id: new mongoDb.ObjectId(this.id)
//     }, {
//       $set: {
//         cart: {
//           items: updatedCartItems
//         }
//       }
//     }).then(result => console.log(result))
//       .catch(err => console.error(err));


//   }

//   addToCart(product) {

//     let newQuantity = 1;
//     //this.cart = null;
//     if (this.cart == null) {
//       this.cart = {
//         items: []
//       };
//     }
//     const updatedCartItems = [...this.cart.items];
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       console.log(cp.productId, " ", product._id)
//       return cp.productId.toString() === product._id.toString()
//     });

//     if (cartProductIndex != -1) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new mongoDb.ObjectId(product._id),
//         quantity: newQuantity
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems
//     };

//     const db = getDb();
//     return db.collection('users').updateOne({
//       _id: new mongoDb.ObjectId(this.id)
//     }, {
//       $set: {
//         cart: updatedCart
//       }
//     }).then(result => console.log(result))
//       .catch(err => console.error(err));

//   }

//   static findById(userId) {
//     const db = getDb();
//     return db.collection('users').findOne({ _id: new mongoDb.ObjectId(userId) })
//       .then(user => {
//         console.log("user", user);
//         return user;
//       })
//       .catch(err => console.error(err));
//   }

//   static createAdminId() {
//     const db = getDb();
//     return db.collection('users').findOne({ name: 'Admin' })
//       .then(user => {
//         if (!user) {
//           new User("Admin", "admin@test.com")
//             .save()
//             .then(newUser => console.log(newUser))
//             .catch(err => console.error(err))
//         }
//       })
//       .catch(err => console.error(err));
//   }

//   addOrder() {
//     const db = getDb();

//     return this.getCart()
//       .then( products => {
//         const order = {
//           items : products,
//           user : {
//             _id : new mongoDb.ObjectId(this.id),
//             name: this.name, 
//           }
//         };
//         return db.collection('orders')
//           .insertOne(order)
//       })
//       .then(result => {
//         //console.log(result);
//         this.cart = { items: [] };
//         return db
//           .collection('users')
//           .updateOne(
//             {
//               _id: new mongoDb.ObjectId(this.id)
//             },
//             {
//               $set: {
//                 cart: {
//                   items: []
//                 }
//               }
//             });
//       });
//   }

//   getOrders(){
//     const db = getDb();
//     return db.collection('orders')
//       .find({ 'user._id' : new mongoDb.ObjectId( this.id )   })
//       .toArray();

//   }
// }



// module.exports = User;
