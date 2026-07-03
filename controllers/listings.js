const Listing = require("../models/listing.js");
const User = require("../models/user.js");
module.exports.index = async(req,res)=>{
    let {q} = req.query;
    let allListings;

    if(q){
        allListings = await Listing.find({
            $or:[
                {title:{$regex:q, $options:"i"}},
                {location: {$regex:q, $options:"i"}},
                {country: {$regex:q, $options:"i"}},
                {description:{$regex:q, $options:"i"}},
                {category:{$regex:q, $options:"i"}}
            ]
        });
        
    }
    else{
   allListings = await Listing.find({});
    }
    res.render("./listings/index.ejs" , {allListings
       
    });
}

 module.exports.renderNewForm = (req,res)=>{
   
    res.render("./listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id).populate({path : "reviews",
        populate:{
            path: "author",
        }}
    )
    .populate("owner");
    if(!listing){
         req.flash("error","Listing you requested for does not exist!");
         return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}


module.exports.createListing =async(req,res,next)=>{
  //for geocoding
 const location = encodeURIComponent(req.body.listing.location);

const response = await fetch(
  `https://api.maptiler.com/geocoding/${location}.json?key=${process.env.MAP_TILER_API_KEY}`
);

const data = await response.json();


if (!data.features || data.features.length === 0) {
  req.flash("error", "Location not found");
  return res.redirect("/listings/new");
}




    let url , filename;

    if (req.file) {
    url = req.file.path;        // Cloudinary URL
    filename = req.file.filename;
} else {
    url = "https://images.unsplash.com/photo-1769745402932-4c93d9e76d98...";
    filename = "default";
}


    // console.log(url);
    // console.log(file);

     
    
    const newlisting = new Listing({
  ...req.body.listing,

});


    newlisting.owner = req.user._id;
    newlisting.image = {url, filename};
    newlisting.geometry = {
        type: "Point",
        coordinates:data.features[0].center,
    };

    let savedListing = await newlisting.save();

    console.log(savedListing);


    req.flash("success","New Listing Created!");
    res.redirect("/listings")
}


module.exports.renderEditForm = async(req,res)=>{
 
   
    let {id} = req.params;
    const listing = await Listing.findById(id);
     if(!listing){
         req.flash("error","Listing you requested for does not exist!");
         return res.redirect("/listings");
    }
    res.render("listings/edit.ejs" , {listing})
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    const listing = req.body.listing;
   
    const newListing = await Listing.findByIdAndUpdate(id , {...listing},{new:true,runValidators: true});
    req.flash("success","Listing Updated");

    res.redirect(`/listings/${id}`);

}

module.exports.deleteListing = async(req,res)=>{
    let{id} = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success","Listing Deleted!");
   res.redirect("/listings");
}

module.exports.showCategory = async(req,res)=>{
    const listings = await Listing.find({});
    let {category} = req.params;
    
        const filteredListings = listings.filter((listing)=>{
            return listing.category.includes(category);
        })

        res.render("./listings/index.ejs",{allListings:filteredListings});
        }

        module.exports.showFavourites = async(req,res)=>{
            let user = await User.findById(req.user._id).populate("favourites");
             res.render("./listings/index.ejs",{allListings:user.favourites});
           
        }

module.exports.ToggleFavourite = async(req,res)=>{
    
    let {id} = req.params;
    let user = await User.findById(req.user._id);
    if(!user.favourites.includes(id)){
        user.favourites.push(id);
    }else{
        user.favourites.pull(id);
    }
    
    await user.save();
    res.redirect("/listings");
}

    
