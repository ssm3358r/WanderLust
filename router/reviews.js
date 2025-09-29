const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const expressError = require("../utils/expressError.js");
const { loggedIn, validateReview, deleteReviewAuth } = require("../middleware.js");
const Review = require("../Models/review.js");
const Listing = require("../Models/listing.js");
const {addReview,deleteReview}=require("../controller/reviews.js");


// Review POST
router.post("/",loggedIn,validateReview,wrapAsync(addReview)
);

// delete review route
router.delete(
  "/:reviewId",deleteReviewAuth,
  wrapAsync(deleteReview)
);

module.exports = router;