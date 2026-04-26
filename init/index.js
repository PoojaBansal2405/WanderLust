const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
.then(()=>{
   console.log("connected to DB");
}).catch((err)=>{
console.log(err);
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

let initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
        ...obj,
        owner:"69bd346cc5826cfd17e732ff",
    }))
    await Listing.insertMany(initData.data);

    console.log("data was initialised");
}

initDB();