const express=require("express");
const router=express.Router();

const wrapAsync=require("../utils/wrapAsync.js");

const Listing =require("../Models/listing.js");
const { loggedIn,isOwner,validateListing } = require("../middleware.js");
const {index,renderNewForm,showListing,createNewListing,renderEditForm,updateListing,deleteListing}=require("../controller/listing.js");
const multer=require("multer"); // for handling multipart/form-data, which is primarily used for uploading files
// const upload=multer({dest:"uploads/"}); // setting up multer for file uploads
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); // multer instance configured to use Cloudinary storage 

// search route - must be before the index route to avoid conflicts
router.get("/search", wrapAsync(index));

// index route
router.route("/")
.get(wrapAsync(index))

.post( loggedIn,upload.single("listing[image][url]"),validateListing,wrapAsync(createNewListing));;

// new route
router.get("/new", loggedIn,wrapAsync(renderNewForm))


//show listing route
router.get("/:id/show",validateListing,wrapAsync(showListing  
))


//edit route
router.get("/:id/edit", loggedIn,isOwner,validateListing,wrapAsync(renderEditForm))

//update route
router.put("/:id", loggedIn,upload.single("listing[image][url]"),validateListing,wrapAsync(updateListing))


//delete route
router.delete("/:id/delete",isOwner,wrapAsync(deleteListing))

module.exports=router;