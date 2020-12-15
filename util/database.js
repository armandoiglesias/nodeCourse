const mongodb = require('mongodb');

let _db;

const mongoConnect = (callback) => {
  const MongoClient = mongodb.MongoClient;
  MongoClient.connect("mongodb://192.168.99.100:27017")
  .then( (client) =>{
    console.log('connected mongodb');
    _db = client.db();
    callback();
  }).catch(err =>{
  
    console.error(err);
  
  });
}

const getDb = () =>{
  if (_db) {
    return _db;
  }
  throw 'No connected to Db';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;




