const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ username, email });
      const registerdUser = await User.register(newUser, password);
      console.log(registerdUser);
      req.login(registerdUser,(err)=>{              // for login directly after doing sign-up
        if(err){
            next()
        }
        req.flash("success", " Welcome to WanderLust");
        res.redirect("/listings");
      })
      
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",saveRedirectUrl,
  passport.authenticate("local", {                  //passport- middleware for doing authentication before going to render anything!
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success","You are logged in sucessfully!");
    let redirectUrl=res.locals.redirectUrl||"/listings"
    res.redirect(redirectUrl)
  }
);

router.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            next(err)
        }
        req.flash("success","You are Logged Out")
        res.redirect("/listings")
    })
})

module.exports = router;
