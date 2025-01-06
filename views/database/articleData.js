// const mongoose  = require('mongoose');;
// const MongoStore = require('connect-mongo');

// mongoose.set('strictQuery', false);
// const session = require('express-session');

// const mongoURI = "mongodb+srv://news-blog:news-blog@cluster01.avvckka.mongodb.net/?retryWrites=true&w=majority&appName=cluster01";

// const connectDB = async() =>{
//     try {
//         const conn = await mongoose.connect(mongoURI);

//     console.log(`Database connected to the ${conn.connection.host}`);

//     } catch (error) {
//         console.error(error);
//     }
// };

// //Creating a session within the DB to store data
// const sessionStore = MongoStore.create({
//     mongoUrl : mongoURI,
//     collectionName : 'news',
//     autoRemove : 'interval',
//     autoRemoveInterval : 10  //10 mintues
//   });

// module.exports = {
//     connectDB, 
//     sessionStore
// };

const { MongoClient } = require('mongodb');
const { db } = require('../model/User');
// const art = require('../../articles.json');
let dbConnection
uri = "mongodb+srv://news-blog:news-blog@cluster01.avvckka.mongodb.net/?retryWrites=true&w=majority&appName=cluster01"



module.exports = {
    connectToDB: (cb) => {
        MongoClient.connect(uri) //Connecting to the local database; also this is async task
        .then((client) =>{
            dbConnection = client.db('news-blog'); // Specify database name here
            console.log('Connected to database');
            return cb();
      })
        .catch((err) => {
            console.error('Error connecting to database:', err);
            return cb(err);
                
        })
        },
    getDB: () => dbConnection
};