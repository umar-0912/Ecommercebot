const mongoose = require("mongoose");

const cartScheama = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    price:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model("cart",cartScheama); 