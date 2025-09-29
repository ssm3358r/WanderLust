const Listing = require("./Models/listing");
const Review = require("./Models/review");
const {listingSchema}=require("./schema.js");
const expressError=require("./utils/expressError.js");
const {reviewSchema}=require("./schema.js");
module.exports.loggedIn=function (req,res,next){
    if(!req.isAuthenticated()){
        req.session.redirectURL=req.originalUrl;
        req.flash("error","You must be logged in first");
        return res.redirect("/user/login");
    }
  
        next();
} 

module.exports.saveRedirectUrl=function(req,res,next){
    if(req.session.redirectURL){
        res.locals.redirectURL=req.session.redirectURL;
    }
    next();
}

module.exports.isOwner = async function(req, res, next) {
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currentUser._id)) {
        req.flash("error", "You cannot edit other owner's listing");
        return res.redirect(`/listings/${id}/show`);
    }
    next();
}
module.exports.validateListing=(req,res,next)=>{
let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }
    else{
        next();
    }
}

module.exports.validateReview =(req,res,next)=>{
let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(401,errMsg);
    }
    else{
        next();
    }
}

module.exports.deleteReviewAuth= async function(req,res,next){
    let {id,reviewId}=req.params;
    let review = await Review.findById(reviewId);
    if(!review || !review.author || !review.author.equals(res.locals.currentUser._id)){
        req.flash("error","You cannot delete other user's review");
        return res.redirect(`/listings/${req.params.id}/show`);
    }
    next();
}