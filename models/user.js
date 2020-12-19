const getDb = require('../util/database').getDb;
const mongoDb = require('mongodb');

class User{
  constructor(username, email, cart, id ){
    this.name = username;
    this.email = email;
    this.cart = cart;
    this.id = id
  }

  save(){
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  getCart(){
    const db = getDb();

    const productsId = this.cart.items.map( i => i.productId )

    return db.collection('products').find({
      _id : {
        $in : productsId
      }
    }).toArray()
    .then( products => {
      return products.map( p =>{
        return {
          ...p,
          quantity : this.cart.items.find( i => {
            return i.productId.toString() === p._id.toString()
          }).quantity
        };
      });
    } );
  
  }


  removeFromCart(productId){
    const updatedCartItems = this.cart.items.filter( item => {
      return item.productId.toString() !==  productId.toString();
    } );
    const db = getDb();
    return db.collection('users').updateOne({
      _id : new mongoDb.ObjectId(this.id)
    }, {
      $set : { 
        cart: {
          items : updatedCartItems
        } 
      }
    }).then( result => console.log(result) )
    .catch( err => console.error(err));


  }

  addToCart(product){
    
    let newQuantity = 1;
    //this.cart = null;
    if (this.cart == null) {
      this.cart = {
        items: []
      };
    }
    const updatedCartItems = [...this.cart.items];
    const cartProductIndex = this.cart.items.findIndex( cp => {
      console.log(cp.productId, " ", product._id )  
      return cp.productId.toString() === product._id.toString()
     });

    if (cartProductIndex != -1) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
      updatedCartItems.push({
        productId : new mongoDb.ObjectId(product._id),
        quantity : newQuantity
      });
    }

    const updatedCart = {
      items: updatedCartItems
    };
    
    const db = getDb();
    return db.collection('users').updateOne({
      _id : new mongoDb.ObjectId(this.id)
    }, {
      $set : { 
        cart:  updatedCart
      }
    }).then( result => console.log(result) )
    .catch( err => console.error(err));

  }

  static findById(userId){
    const db = getDb();
    return db.collection('users').findOne( { _id  : new mongoDb.ObjectId(userId) } )
      .then( user => {
        console.log("user" , user);
        return user;
      } )
      .catch(err => console.error(err));
  }

  static createAdminId(){
    const db = getDb();
    return db.collection('users').findOne({ name : 'Admin' })
      .then( user => {
        if (!user) {
          new User("Admin", "admin@test.com")
            .save()
            .then(newUser => console.log(newUser))
            .catch( err => console.error(err) )
        }
      } )
      .catch(err=> console.error(err) );
  }
}

module.exports = User;
