if(process.env.Node_ENV!=="production")
{
require("dotenv").config();
}

console.log(process.env.SECRET_CODE);
const express=require("express");
const app=express();
const wrapAsync=require("./utils/wrapAsync.js");
const expressError=require("./utils/expressError.js");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate);
const path=require("path");
app.use(express.static(path.join(__dirname,"/public")));
const Listing = require("./Models/listing.js");
const session=require("express-session");

const MongoStore = require('connect-mongo');

const connectFlash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./Models/user.js");


const store = MongoStore.create({
    mongoUrl: process.env.ATLAS_URL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600 ,// time period in seconds

});

store.on("error",function(e){ 
    console.log("session store error",e);
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    //exploring cookie options
   cookie: {
    httpOnly: true,
    expires: Date.now() +  7*24*60*60*1000, // 7 days later
    maxAge: 7*24*60*60*1000,
}
};


app.use(session(sessionOptions));
app.use(connectFlash());// flash message

app.use(passport.initialize());// initialising passport
app.use(passport.session());// using session with passport
passport.use(new localStrategy(User.authenticate()));// authentication method of user model

passport.serializeUser(User.serializeUser());// store user in session
passport.deserializeUser(User.deserializeUser());// get user from session

app.get("/demouser",async(req,res)=>{
let user=new User({email:"malviya.sourabh,124@gmail.com",
    username:"Sourabh Malviya"

})
let registeredUser=await User.register(user,"Sourabh@123");
res.send(registeredUser);
})


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user; // req.user is provided by passport and contains the authenticated user
    next();
});

app.set("view engine","ejs")
app.use(express.urlencoded({extended : true}))
const Review =require("./Models/review.js");

const listingsRouter=require("./router/listing.js");

const reviewRouter=require("./router/reviews.js");
const userRouter=require("./router/user.js");

app.use("/listings",listingsRouter);

app.use("/listings/:id/reviews",reviewRouter);

app.use("/user",userRouter);
// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const AtlasUrl=process.env.ATLAS_URL;
async function main() {
  await mongoose.connect(AtlasUrl);
}

main().then((res)=>{
    console.log("connected to database successfuly");
    
}).catch(err => console.log(err));

let port=8080;
app.listen(port,()=>{
    console.log('listening carefullly');
    
})

// app.get("/",(req,res)=>{
//     res.send("working very well,go on")
// })



// app.get("/testListing",validateListing,async (req,res)=>{
//     let sampleListing =new Listing({
//         title :"My new villa",
//         description:"By the beach",
//         price : 1200,
//         location : "Bistan , Khargone",
//         country : "India"
//     });

//     await sampleListing.save().then((result)=>{
//         console.log('succesfuly saved');
//         res.send("successfuly tested");
        
//     })
// })


app.all(/.*/, (req, res, next) => {
    next(new expressError(404, "Page Not Found"));
});

// handling above wrong page requests and all other error coming

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message})
})
