const mongoose = require("mongoose");

const Listing = require("../models/listing.js");
require("dotenv").config();

const db_URL = process.env.ATLASDB_URL
main()
.then(()=>{
   console.log("connected to DB");
}).catch((err)=>{
console.log(err);
})

async function main(){
    await mongoose.connect(db_URL);
}

async function updateListings(){
    const listings = await Listing.find({});

    for(let listing of listings){
        try{
            const location = encodeURIComponent(listing.location);

            const response = await fetch(`https://api.maptiler.com/geocoding/${location}.json?key=${process.env.MAP_TILER_API_KEY}`);

            const data = await response.json();
          if (data.features && data.features.length > 0) {
                listing.geometry = {
                    type: "Point",
                    coordinates: data.features[0].center,
                };

                await listing.save();
                console.log("updated location");
            }else{
                 console.log("location not found");
            }

        }catch(err){
            console.log("error",error.message);
        }
    }
     mongoose.connection.close();
}

updateListings();