const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

// it is a post middleware that occurs when a listing is deleted using an operation findOneAndDelete and that listing had reviews also under it, so it will delete the related reviews also

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;


// filename: String,
//     url: {
//       type: String,
//       default:
//         "https://miro.medium.com/v2/resize:fit:1200/1*WpFxuBpMV9Qki4399SEV4A.jpeg",
//       set: (v) =>
//         v === ""
//           ? "https://miro.medium.com/v2/resize:fit:1200/1*WpFxuBpMV9Qki4399SEV4A.jpeg"
//           : v,
//     },