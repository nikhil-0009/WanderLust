require('dotenv').config()

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path=require("path")
const methodOverride=require('method-override')
const ejsMate=require("ejs-mate")
const listingRouter=require('./routes/listing.js')
const reviewRouter=require('./routes/review.js')
const userRouter=require('./routes/user.js')
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user.js')


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname,"public")))

const sessionOptions={
  secret:'mysecretcode',
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000
  }
}

app.get("/", (req, res) => {
  res.redirect('/listings');
});

app.use(session(sessionOptions))    // for storing the sessions
app.use(flash())        // for res.flash messages

app.use(passport.initialize())                            //basic step for using passport-js
app.use(passport.session())                                 // used for authentication for session id
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
  res.locals.success=req.flash("success")
  res.locals.error=req.flash("error")
  res.locals.currUser=req.user
  // console.log(req.user);
  next()
})
app.use("/listings",listingRouter)
app.use("/listings/:id/reviews/",reviewRouter)
app.use("/",userRouter)

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// app.all("*",(req,res,next)=>{
//     next(new expressError(404,'page not found'))
// })

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("listings/error", { err });
});
app.listen(8080, () => {
  console.log("port is learning on 8080");
});
