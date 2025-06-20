const express=require('express')
const router=express.Router({ mergeParams: true })
const wrapAsync=require("../utils/wrapAsync.js")
const expressError=require("../utils/expressError.js")
const {reviewSchema}=require("../schema.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedin, isAuthor } = require('../middleware.js')

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body.review);
  if (error) {
    const messages = error.details?.map(el => el.message).join(", ") || "Invalid input";
    return res.status(400).send(messages);
  }
  next();
};

//Post route for Adding reviews
router.post("/",isLoggedin,validateReview,async(req,res)=>{
    let listing= await Listing.findById(req.params.id)
    let newReview=new Review(req.body.review)
    newReview.author=req.user._id
    listing.reviews.push(newReview)
    await newReview.save()
    await listing.save()
    
     req.flash("success", " New review added")
    res.redirect(`/listings/${listing.id}`)
})

//Post route for Deleting reviews
router.delete("/:reviewId",isLoggedin,isAuthor,wrapAsync(async(req,res)=>{
    let {id, reviewId}=req.params
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
     req.flash("success", " review deleted")
    res.redirect(`/listings/${id}`)
}))

module.exports=router