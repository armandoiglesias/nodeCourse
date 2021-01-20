const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;

const User = require('./models/user');

const MONGO_DB_URI = "mongodb://192.168.99.100:27017";


const app = express();
const store = new MongoDbSession({
  uri : MONGO_DB_URI,
  collection :"sessions"
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret : 'Session',
  resave: false,
  saveUninitialized : false,
  store : store
}));

// app.use((req, res, next) => {
//   User.findById("5ff61dc0f8df9732ec3cc7cd")
//     .then(user => {
//       req.user = user;
//       next();
//     })
//     .catch(err => console.log(err));
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose.connect(MONGO_DB_URI).then(
  connection => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Admin II',
          email: 'correo@correo.com',
          cart: {
            items: []
          }
        });
        user.save()
          .then(result => console.log(result));
      }
    });
 
    app.listen(3000);
  }
).catch(err => console.error(err));

// mongoConnect( () =>{
//   User.createAdminId();
//   //console.log(mongoClient)
//   app.listen(3000);
// } );

// docker run --name localmongo -p 27017:27017 -d mongo
// docker restart localmongo
// double check userId


