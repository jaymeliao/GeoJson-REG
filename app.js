require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
  secret: "Your Own Secret.",
  resave:false,
  saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());




// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});


const UserSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: [true, 'Please Enter Your First Name'],
    },
    lastName: {
      type: String,
    },
    age:{
      type: Number,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },

  });
//HASH AND SALT
UserSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", UserSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//var accessable=false;

app.get("/", function(req,res) {
    res.render("index",{accessable:accessable});
})

app.get("/login", function(req,res) {
    res.render("login");
})

app.post("/login", function(req,res) {
   var email = req.body.email;
   var password = req.body.password;
    User.findOne({email: email}, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                if(foundUser.password === password){
                    res.render("index", {accessable: true});
                }
            }
        }
    })
})




app.get("/register", function(req,res) {
    res.render("register",{errMsg: ""});
})

app.post("/register", function(req,res) {
    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age,
        email: req.body.email,
        password: req.body.password,
    });
    newUser.save(function(err) {
        if(err) {
            console.log(err);
            if (err.code === 11000) {
                res.render("register", {errMsg: `Email:${req.body.email} already exists`});
            }else{
                res.render("register",{errMsg: err.message});
            }
        } else {
            res.render("index", {accessable: true});
        }
    })

})
/*
app.post('/register',function(req,res){
  User.register
})
*/
app.get("/logout",function(req,res){
    res.render("index", {accessable: false});
})
app.get("/addLocation", function(req,res) {
    res.render("addLocation");
})




app.listen(process.env.PORT, function() {
    console.log(`Server started on port ${process.env.PORT}`);
});
