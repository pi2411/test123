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
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
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
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/userDB",
 {useNewUrlParser: true,
  useUnifiedTopology: true
},
);
mongoose.set('useCreateIndex', true);
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId:String,
  facebookId:String,
  secret:String,
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID:     process.env.CLINET_ID,
  clientSecret: process.env.CLINTE_SECRET,
  callbackURL: "http://localhost:3000/auth/google/tests",
  passReqToCallback   : true
},
function(request, accessToken, refreshToken, profile, done) {
  // console.log(profile);
  User.findOrCreate({ googleId: profile.id ,username: profile.emails[0].value }, function (err, user) {
    return done(err, user);
  });
}
));
passport.use(new FacebookStrategy({
    clientID: process.env.CLINTE_ID_FB,
    clientSecret: process.env.CLINET_SECRET_FB,
    callbackURL: "http://localhost:3000/auth/facebook/secrets",
    profileFields: ['id', 'displayName', 'photos', 'email'],
  },

  function(accessToken, refreshToken, profile, cb) {
     // console.log(profile);
    User.findOrCreate({ facebookId: profile.id,username: profile.emails[0].value }, function (err, user) {
      return cb(err, user);
    });
  }
));

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
app.get('/auth/google',
  passport.authenticate('google', { scope:["profile","email"] }
));
app.get("/auth/google/tests",
    passport.authenticate( "google", {
        successRedirect: "/secrets",
        // failureRedirect: "/login",
}));
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {

    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });
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
      res.redirect("/home");
    }else{
      passport.authenticate("local")(req,res,function(err){
        res.redirect("secrets")
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
        res.redirect("secrets")
      })
    }
  })
})
app.get("/secrets",function(req,res){
  User.find({"secret":{$ne:null}},function(err,user){
    if(!err){
      res.render("secrets",{usersSecrets:user})
    }
  })
})
app.get("/logout",function(req,res){
  Post.find({},function(err,foundPost){
    res.render("home",{startingContent: homeStartingContent,post: foundPost});
  })
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
            res.redirect("/secrets");
          }
        })
      }
    }
  })
})
app.listen(3000, function() {
  console.log("Server started on port 3000.");
});