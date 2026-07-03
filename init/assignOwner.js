const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
require("dotenv").config();

main().then(() => {
  console.log("connected to DB");
  assignOwner();
}).catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
}

async function assignOwner() {
  const ownerId = "6a4761b09ae0e5facde5dd7c"; // pooja ka ID

  const result = await Listing.updateMany(
    {},
    { $set: { owner: ownerId } }
  );

  console.log(`${result.modifiedCount} listings updated with owner`);
  mongoose.connection.close();
}
