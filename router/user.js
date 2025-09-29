const express=require("express");
const router=express.Router({mergeParams:true});
const User=require("../Models/user");// <-- use uppercase 'Models'
let {saveRedirectUrl}=require("../middleware"); // <-- destructuring assignment to get saveRedirectUrl
const wrapAsync=require("../utils/wrapAsync");
const passport = require("passport");
const { route } = require("./listing");
const {renderSignup,registerUser,renderLogin,userLogin,userLogout}=require("../controller/users.js");


//rendering signup form
router.route("/signup").get(renderSignup)
.post(saveRedirectUrl,registerUser);



//rendering login form
 router.route("/login").get(renderLogin)
 .post(saveRedirectUrl,passport.authenticate("local",{failureFlash:true,failureRedirect:"/user/login"}),userLogin);

 //passport.authenticate- it is a middleware that will authenticate the user
 //failureFlash- if authentication fails, it will flash a message
 //failureRedirect- if authentication fails, it will redirect to the specified route
 //if authentication is successful, it will call the next function in the route handler

 router.get("/logout",userLogout)

module.exports=router;