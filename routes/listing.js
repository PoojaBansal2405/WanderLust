const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");

const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const {isLoggedIn , isOwner , validateListing} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const listingController = require("../controllers/listings.js");

router.route("/")
    //Index Route
    .get(wrapAsync(listingController.index))

    //Create Route
    .post( isLoggedIn , upload.single("listing[image]") , wrapAsync(listingController.createListing)
);

//New Route
router.get("/new" , isLoggedIn ,listingController.renderNewForm) ;
router.get("/favourites" , isLoggedIn ,listingController.showFavourites);
router.get("/category/:category",listingController.showCategory);

router.route("/:id")
    //show route
     .get( wrapAsync(listingController.showListing))


//Update Route
      .put( isLoggedIn , isOwner , upload.single("listing[image]"),
      validateListing, wrapAsync(listingController.updateListing))


//delete Route
      .delete(isLoggedIn , isOwner ,wrapAsync(listingController.deleteListing)
    
    );


router.post("/:id/favourite" , isLoggedIn , listingController.ToggleFavourite);


//Edit Route
router.get("/:id/edit" ,isLoggedIn , isOwner , wrapAsync(listingController.renderEditForm));











module.exports = router;