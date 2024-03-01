const mongoose = require('mongoose');

const hsnSchema = new mongoose.Schema({
    HSN_Code:{
        type:String,
    },
    HSN_Description:{
        type:String,
    }
});


module.exports=mongoose.model("HSNCODES",hsnSchema)