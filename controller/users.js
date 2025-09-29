const User=require("../Models/user.js");



module.exports.renderSignup=(req,res)=>{
    res.render("signup");
}

module.exports.registerUser=async(req,res)=>{
    try{
        let {username,email,password}=req.body;
    const newUser=new User({username,email});// we are not passing password directly to the model
    const registeredUser=await User.register(newUser,password);// this method is provided by passport local mongoose to hash the password and store it in the db
    console.log('registeredUser',registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            next(err);
        }
         req.flash("success","welcome to wanderlust");
    res.redirect("/listings");
    })
   
    
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/user/signup");
    }
    
}
    
    
   
 
 module.exports.renderLogin=(req,res)=>{
    res.render("login");
 }

 module.exports.userLogin = (req, res) => {
    req.flash("success", "Welcome back!");
    // Redirect to the originally requested URL or to /listings
    const redirectUrl = res.locals.redirectURL || "/listings";
    res.redirect(redirectUrl);
};

 module.exports.userLogout =(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })}