
const Listing = require("./models/listing.js");
const expressError = require("./utils/expressError.js");
const Review = require("./models/review");
const {listingSchema , reviewSchema} = require("./schema.js");
module.exports.isLoggedIn =(req,res,next)=>{
     

    if(!req.isAuthenticated()){
       if (req.originalUrl.includes("/favourite")) {
            req.session.redirectUrl = "/listings";
        } else {
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error", "You must be logged in to create listing");
        return res.redirect("/login");
    }

    next();
}

module.exports.saveRedirectUrl = (req , res , next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.validateListing =(req,res,next)=>{
     let {error} = listingSchema.validate(req.body);
    //  console.log(result);
     if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new expressError(400 , errMsg);
     }else{
        next();
     }
}

//Authorization
module.exports.isOwner = async(req , res , next)=>{
      let { id } = req.params; 
     let listing = await Listing.findById(id).populate("owner");

    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error" , "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }

  next();
}

module.exports.validateReview = (req,res,next)=>{
    let{error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new expressError(400 , errMsg);
     }else{
        next();
     }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
let {id , reviewId} = req.params;
let review = await Review.findById(reviewId);

if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error" , "You have not created this review");
    return res.redirect(`/listings/${id}`);
}
next();
}