//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const cookieParser = require('cookie-parser');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const facebookStrategy = require('passport-facebook').Strategy
const findOrCreate = require('mongoose-findorcreate');
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
const app = express();
app.set('view engine', 'ejs');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
  app.use(cookieParser());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

const User = require("./models/User");

passport.use(new GoogleStrategy({
    clientID:     "695366370115-v1rf24a68mnq83oi4gpkbdbt8mqibkcf.apps.googleusercontent.com",
    clientSecret: "jtsRGWIYksAq2BHIgtaEaBlK",
    callbackURL: "http://localhost:3000/auth/google/tests",
    profileFields   : ['id','displayName','name','gender','picture.type(large)','email']
  },
  function(accessToken, refreshToken, profile, cb) {
         User.findOrCreate({uid: profile.id}, function (err, user) {
           console.log('A new uxer from "%s" was inserted', user.uid);
           if(user){
             user.pic = profile.photos[0].value;
             user.token=accessToken,
             user.username= profile.emails[0].value;
             user.email= profile.emails[0].value,
             user.name=profile.name.givenName + ' ' + profile.name.familyName,
             user.save();
             return cb(err, user);
           }

         });
     }
));


passport.use(new facebookStrategy({

    // pull in our app id and secret from our auth.js file
    clientID        : "357939236043170",
    clientSecret    : "8fc3ca87e980e5d60bf16952cd5970b7",
    callbackURL     : "http://localhost:3000/auth/facebook/profile",
  profileFields   : ['id','displayName','name','gender','picture.type(large)','email']

},

function(accessToken, refreshToken, profile, cb) {
       User.findOrCreate({uid: profile.id}, function (err, user) {
         console.log('A new uxer from "%s" was inserted', user.uid);
         if(user){
           user.pic = profile.photos[0].value;
           user.token=accessToken,
           user.username= profile.emails[0].value;
           user.email= profile.emails[0].value,
           user.name=profile.name.givenName + ' ' + profile.name.familyName,
           user.save();
           return cb(err, user);
         }

       });
   }
        // const newUser = User({
        //   username: profile.emails[0].value ,
        //   token:accessToken,
        //   pic:profile.photos[0].value,
        //   email:profile.emails[0].value,
        //   name:profile.name.givenName + ' ' + profile.name.familyName,

));

                             //test check if mongoose work
// const newUser = User({
//   uid:"ygal",
//   token:1234,
//   email:"ygalna9764@gmail.com",
//   name:"ygal",
//   gender:"male",
//   pic:"pic",
// })
// newUser.save();
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get('/profile', isLoggedIn, function(req, res) {
    console.log(req.user)
    res.render('profile', {
        user : req.user // get the user out of session and pass to template
    });
});

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
app.get('/auth/google',
  passport.authenticate('google', { scope:["profile","email"] }
));
app.get("/auth/google/tests",
    passport.authenticate( "google", {
        successRedirect: "/profile",
        // failureRedirect: "/login",
}));
app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

app.get('/auth/facebook/profile',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    const postSchema = new mongoose.Schema({
      title:String,
      content:String,
    })
    const Post = mongoose.model("post",postSchema);

    // let posts = [];

    app.get("/", function(req, res){
        Post.find({},function(err,foundPost){
          res.render("home",{startingContent: homeStartingContent,post: foundPost});
        })

    });

    app.get("/about", function(req, res){
      res.render("about", {aboutContent: aboutContent});
    });

    app.get("/contact", function(req, res){
      res.render("contact", {contactContent: contactContent});
    });

    app.get("/compose", function(req, res){
      res.render("compose");
    });

    app.post("/compose", function(req, res){
    const nameTitle = req.body.postTitle;
    const nameBody = req.body.postBody;
    console.log(nameTitle)
    console.log(nameBody)
    const newPost = Post({
      title:nameTitle,
      content:nameBody,
    })
    newPost.save(function(err){
      if(!err){
        res.redirect("/");
      }
    });
    })
    app.get("/posts/:postName", function(req, res){
    const namePost = req.params.postName;
    console.log(namePost);
      Post.findOne({title: namePost}, function(err, post){
        res.render("post", {title: post.title,content: post.content,});
      });
    });

//text area//
app.get("/login",function(req,res){
  res.render("login");
})
app.post("/login",function(req,res){
  const user = User({
    username:req.body.username,
    password:req.body.password,
  })
  req.login(user,function(err){
    if(err){
      res.redirect("/");
    }else{
      passport.authenticate("local")(req,res,function(err){
        res.redirect("profile")
      })
    }

  })
})
app.get("/register",function(req,res){
  res.render("register")
})
app.post("/register",function(req,res){
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register")
    }else{
      passport.authenticate("local")(req,res,function(err){
        res.redirect("profile")
      })
    }
  })
})
app.get("/profile",function(req,res){
  User.find({"secret":{$ne:null}},function(err,user){
    if(!err){
      res.render("profile",{usersSecrets:user})
    }
  })
})
app.get("/logout",function(req,res){
  req.logout();
  res.render("/");
})
app.get("/submit",function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");
  }else{
    res.redirect("/login");
  }
})
app.post("/submit",function(req,res){
  const submititSecrets = req.body.secret;
  // console.log(submititSecrets);
   console.log(req.user.id);
  User.findById(req.user.id,function(err,foundScrets){
    if(err){
      console.log(err);
    }else{
      if(foundScrets){
        foundScrets.secret = submititSecrets;
        foundScrets.save(function(err){
          if(!err){
            res.redirect("/profile");
          }
        })
      }
    }
  })
})

app.use(session({
    name: "random_session",
    secret: "yryGGeugidx34otGDuSF5sD9R8g0Gü3r8",
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: "/",
        secure: true,
        //domain: ".herokuapp.com", REMOVE THIS HELPED ME (I dont use a domain anymore)
        httpOnly: true
    }
}));
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
