const Review=require("../Models/review.js");
const Listing=require("../Models/listing.js");

module.exports.addReview=async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new expressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview.author);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully posted a review");
    res.redirect(`/listings/${listing._id}/show`);
  }

  module.exports.deleteReview=async (req, res) => {
      let { id, reviewId } = req.params;
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findById(reviewId);
  
      req.flash("success", "Successfully deleted a review");
      res.redirect(`/listings/${id}/show`);
    }