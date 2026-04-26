const express = require("express");
const router = express.Router({mergeParams:true});
const Review = require("../models/review");

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const {reviewSchema} = require("../schema.js");
const {validateReview, isLoggedIn , isReviewAuthor}=require("../middleware.js");
const reviewController = require("../controllers/review.js");

router.post("/" , isLoggedIn , validateReview , wrapAsync(reviewController.createReview));



//delete route
router.delete("/:reviewId" ,isLoggedIn ,isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;