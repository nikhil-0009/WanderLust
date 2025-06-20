const express=require('express')
const router=express.Router({mergeParams:true})
const wrapAsync=require("../utils/wrapAsync.js")
const expressError=require("../utils/expressError.js")
const {listingSchema}=require("../schema.js")
const Listing = require("../models/listing.js");
const {isLoggedin, isOwner}=require('../middleware.js')
const multer=require('multer')
const {storage}=require('../cloudConfig.js')
const upload= multer({storage})


const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body.listing)            //validate is a JOI built-in function
    if(error)
        {
        let errMsg=error.details.map((el)=>el.message).join(',')
        throw new expressError(404,errMsg)
    }
    else{
        next()
    }
}

router.get("/",wrapAsync(async (req,res)=>{
    const allListings= await Listing.find({})
    res.render("listings/index.ejs",{allListings})
}))

router.get("/new",isLoggedin,(req,res)=>{
    res.render("listings/new.ejs")
})

router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params
    //populate is used to get relevant data of the output
    const listing=await Listing.findById(id).populate({path: "reviews",populate:{path:"author"}}).populate("owner")     
    if(!listing){
        req.flash("error", "listing you requested does not exist")
        res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing})
})
)

router.post("/new",isLoggedin, upload.single("listing[image]"),validateListing,wrapAsync(async (req, res, next) => {
    let url=req.file.path
    let filename=req.file.filename
    const listingData = req.body.listing;
    
    // Convert string to object for consistency
    if (typeof listingData.image === "string") {
        listingData.image = { url: listingData.image };
    }

    const newListing = new Listing(listingData);
    newListing.owner=req.user.id
    newListing.image={url, filename}
    await newListing.save();
    req.flash("success", "new listing created")
    res.redirect("/listings");
}));


//edit Form rendering
router.get("/:id/edit",isLoggedin,isOwner,wrapAsync(async (req,res)=>{
    const {id}=req.params
    const list=await Listing.findById(id)
    if(!list){
        req.flash("error","THe Listing you requested is not Available")
        res.redirect("/listings")
    }
    let orignalImage=list.image.url
   orignalImage = orignalImage.replace("/upload", "/upload/c_fill,w_250,h_200");
    res.render("listings/edit.ejs",{list,orignalImage})
}))

//editing the inside content of the form
router.patch("/:id",isLoggedin,upload.single("listing[image]"),validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const updatedListing = req.body.listing;
    
    // Convert image string to object format
    if (typeof updatedListing.image === "string") {
        updatedListing.image = { url: updatedListing.image };
    }
    const item = await Listing.findByIdAndUpdate(id, updatedListing, {
        new: true,
        runValidators: true,
    });
    if( req.file!==undefined){
    let url=req.file.path
    let filename=req.file.filename
    item.image={url, filename}
    await item.save()
    }
     req.flash("success", " listing Updated")
    res.redirect(`/listings/${id}`);
}));
//DELETE A LISTING
router.delete("/:id",isLoggedin,isOwner,wrapAsync(async (req,res)=>{
    const {id}=req.params
    await Listing.findByIdAndDelete(id)
    req.flash("success", " listing deleted")
    res.redirect("/listings")
}))

module.exports=router