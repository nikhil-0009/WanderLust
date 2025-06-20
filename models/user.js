const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose')

const userSchema= new Schema({
    email:{
        type:String,
        required:true
    }
})

userSchema.plugin(passportLocalMongoose)                           // Adds username, hash, and salt fields to your schema.

module.exports=mongoose.model("User",userSchema)