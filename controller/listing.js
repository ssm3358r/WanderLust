const Listing=require("../Models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req,res)=>{
    const {q} = req.query;
    let allListings;
    
    if(q){
        // Search in title, description, location, and country
        allListings = await Listing.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } },
                { country: { $regex: q, $options: 'i' } }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    
    res.render("index.ejs",{allListings, searchQuery: q || ''})
}

module.exports.renderNewForm=async (req,res)=>{ 
    res.render("new.ejs")
 }

module.exports.showListing=async (req,res)=>{
        const {id}=req.params;
        const listing = await Listing.findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner");
        console.log(listing);
        if(!listing){
            req.flash("error","Cannot find that listing");
            return res.redirect("/listings");
        }
        res.render("show",{listing});
    }

module.exports.createNewListing=async (req,res,next)=>{
let response=await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
   limit: 1
 }).send();

//  console.log(response.body.features[0].geometry.coordinates);

 

    let url, filename;
    if (req.file) {
        url = req.file.path;
        filename = req.file.filename;
    } else {
        url = "https://unsplash.com/photos/sunlight-illuminates-rugged-mountain-peaks-at-dawn-P62t7VRFHmg";
        filename = "listingimage";
    }
    let newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id; // assuming req.user is populated by authentication middleware
    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;
    if (!req.body.listing.image || !req.body.listing.image.url) {
        // nothing to delete, just keep defaults
    }
    
    let savedListing=await newListing.save();
    console.log(savedListing);
    
    req.flash("success","Successfully made a new listing");
    res.redirect("/listings");
}


module.exports.renderEditForm= async (req,res)=>{
        const {id}=req.params;
        const listing = await Listing.findById(id);
        if(!listing){
            req.flash("error","Cannot edit that listing");
            return res.redirect("/listings");
        }
        let originalImageurl=listing.image.url;
        
        originalImageurl=originalImageurl.replace("/upload","/upload/h_300/w_250")

        res.render("edit.ejs",{listing,originalImageurl});
    }


module.exports.updateListing=  async (req,res)=>{
    const {id}=req.params;
//      if (!req.body.listing.title || !req.body.listing.price || !req.body.listing.location) {
//   console.log("error aaya");
//   throw new expressError(400, "Missing required fields");
// }
// if (!req.body.listing.image.url) {
//   delete req.body.listing.image.url;  // remove empty string
// }
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
     if(typeof req.file!=="undefined"){
           let url = req.file.path;
        let filename = req.file.filename;
        listing.image={url,filename};
        await listing.save();
     }
     req.flash("success","Successfully edited the  listing");
    res.redirect(`/listings/${id}/show`);
}


module.exports.deleteListing=async (req,res)=>{
        const {id}=req.params;
        let listing= await Listing.findByIdAndDelete(id);
        if(!listing){
            req.flash("error","listing is not found");
            return res.redirect("/listings");
        }
        req.flash("success","Successfully deleted a listing");
        res.redirect("/listings");
    }