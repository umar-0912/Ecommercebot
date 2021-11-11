const mongoose = require("mongoose");

const userScheama = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    zip:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model("user",userScheama); 