 const mongoose = require("mongoose");
const Review = require("./review.js"); 
const Reservation = require("./reservation.js");
const User = require("./user.js"); 
 const schema=mongoose.Schema;
 const listingSchema=new  schema({
    title:{
        type : String,
        required : true

    },
    description :{
        type : String ,
        required : true
    },
   image: {
  filename: String,
   url:String,
}

        ,
    price :{
        type : Number
    }    ,
    location : {
        type :String
    },
    country :{
        type : String
    },

    reviews:[
        {
        type:schema.Types.ObjectId,
        ref:"Review"
    },
   
    ]
    ,
     owner:{
        type:schema.Types.ObjectId,
        ref:"User"
    },
    geometry:{
        type:{
            type:String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    }
}
 )
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        // Remove child documents so we do not leave orphaned reviews or bookings behind.
        await Review.deleteMany({_id:{$in :listing.reviews}})
        await Reservation.deleteMany({ listing: listing._id });
    }
 })
 const Listing = mongoose.model("Listing",listingSchema);
 module.exports =Listing;
