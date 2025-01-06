const mongoose  = require('mongoose');;
const MongoStore = require('connect-mongo');

mongoose.set('strictQuery', false);
const session = require('express-session');

const mongoURI = "mongodb+srv://news-blog:news-blog@cluster01.avvckka.mongodb.net/?retryWrites=true&w=majority&appName=cluster01";

const connectDB = async() =>{
    try {
        const conn = await mongoose.connect(mongoURI);

    console.log(`Database connected to the ${conn.connection.host}`);

    } catch (error) {
        console.error(error);
    }
};

//Creating a session within the DB to store data
const sessionStore = MongoStore.create({
    mongoUrl : mongoURI,
    collectionName : 'session-gamerz',
    autoRemove : 'interval',
    autoRemoveInterval : 10  //10 mintues
  });

module.exports = {
    connectDB, 
    sessionStore
};