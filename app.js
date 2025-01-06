require("dotenv").config;
const art = require('./articles.json');

const { connectToDB, getDB } = require("./views/database/articleData");
const { ObjectId } = require("mongodb");

const fs = require('fs/promises');
const path = require('path');
const jsonFilePath = path.join(__dirname, './articles.json');

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const methodOverride = require("method-override");
const { title } = require("process");

const articles = require('./articles.json');
const { connectDB, sessionStore } = require("./views/database/db");
const { updateArticles } = require("./views/database/fetchData");
const User = require("./views/model/User");
const { isLoggedIn } = require('./checkAuth/checkAuth');
const News = require('./views/model/News');
const { profile } = require("console");

//Express App
const app = express();

//Storing data into json file
setInterval(updateArticles, 600000);

// updateArticles();  // <= For Initial update

//Fetching articles property
// console.log(article[0].title);

// for (let i=0; i < article.length; i++) {
//   let title = article[i].title;
//   let img = article[i].img;
//   let url = article[i].article_url;

//   let arr = {
//     title : title,
//     img : img,
//     url : url,
//   };
// };

// const dchd = async () =>{

//   const data = await fs.readFile(jsonFilePath , 'utf-8');
//   let jsonData = JSON.parse(data);

//   // console.log(jsonData[0].title);
//   title = jsonData[0].title;
// };

// console.log(title)


//MongoDB
connectDB();
const mongoURI =
  "mongodb+srv://news-blog:news-blog@cluster01.avvckka.mongodb.net/?retryWrites=true&w=majority&appName=cluster01";

//Middleware and Static file
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const port = process.env.PORT || 5000;

//Template and View Engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout/main.ejs");

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
    clientID: '1084416862041-gv5q867335o38jrdh0t0aobi6fjucmg1.apps.googleusercontent.com' || process.env.GOOGLE_CLIENT_ID,
    clientSecret: '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' || process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/google/callback' || process.env.GOOGLE_CALLBACK_URL,
  },
  async function(accessToken, refreshToken, profile, done ){

    const newUser = {
      googleId : profile.id,
      displayName : profile.displayName,
      firstName : profile.name.givenName,
      lastName : profile.name.familyName,
      profileImage : profile.photos ? profile.photos[0].value : '/path/to/default/image.jpg'
    };

    try {
      
      let user = await User.findOne({ googleId : profile.id });

      if(user) {
        done(null, user);
      } else {
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (error) {
      console.error(error);
      done(error, null);
    }
  }
)
);

//Persist User data after successful authentication
passport.serializeUser((user, done) =>{
  done(null , user.id);
});

//Retrive user data from session
passport.deserializeUser(async(id, done) =>{
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

//Routes
app.get("/", async (req, res) => {
  try {
    res.redirect("/landing");
  } catch (error) {
    console.error(error);
  }
});

//Google login Route
app.get('/auth/google', passport.authenticate('google', {scope : ['email', 'profile']}));

//Retrive User data
app.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect : '/login-failure',
    successRedirect : '/news',
  })
);

//Fialure to login
app.get('/login-failure' , async(req, res) =>{
  try {
    res.send('Something went wrong...!')
  } catch (error) {
    console.log(error);
  }
});

//Logout button
app.get('/logout' , (req, res) =>{
  req.session.destroy((error) =>{
    if (error) {
      console.log(error);
      res.send('Error Loggin Out');
    } else { res.redirect('/')}
  })
} );


//landing GET Request
app.get("/landing", async (req, res) => {
  const local = {
    title: "landing Page",
    description: "Free Node.JS Gamers News Blog App",
  };

  try {
    res.render("index", { local });
  } catch (error) {
    console.error(error);
  }
});

// Database connection
let db;
connectToDB((err) => {
  if (!err) {
    db = getDB();

    // db.collection("newz").insertMany({art} , {unique: true})

    db.collection("newz")
      .createIndex({ title: 1 }, { unique: true })
      .catch((err) =>
        console.error("Error creating unique index on title:", err)
      );

    // Check if the 'title' index exists, create if it doesn’t or drop and recreate
    db.collection("newz").indexes().then((indexes) => {
      const titleIndex = indexes.find((index) => index.name === "title_1");

      // If title index does not exist or is not unique, create it
      if (!titleIndex || !titleIndex.unique) {
        if (titleIndex) {
          db.collection("newz").dropIndex("title_1"); // Drop existing index
        }
      }
    });
  }
});



//Actually News Page
app.get("/news", isLoggedIn ,async (req, res) => {
  const local = {
    title: "Gamez News",
    description: "Free Node.JS Gamers News App",
  };

  try {
    res.render("news", {
      local,
      articles,
      layout: "layout/news_main",
    });
  } catch (error) {
    console.error(error);
  }
});

app.post('/news', isLoggedIn, async(req, res) =>{

  db.collection('news').insert(art)

})

//Listening on the localhost 5000
app.listen(port, () =>
  console.log(`Gamer News Blog App listening on port ${port}!`)
);