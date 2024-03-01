const mongoose=require("mongoose");

const productSchema = new mongoose.Schema(
    {
        "title":{
            type:String,
            required:true
        },
        "HSN_Code":{
            type:String,
            required:true
        },
        "description":{
            type:String,
            required:true
        },
        "price":{
            type:Number,
            required:true,
            minimum:[0,"Value cannot be less than 0"]
        },
        "discountPercentage":{
            type:Number,
            required:false,
            maximum:[100,"Discount cannot be greater than 100%"]
        },
        "rating":{
            type:Number,
            required:false,
            minimum:[0,"Rating cannot be less than 0"],
            maxmimum:[5,"Rating cannot be greater than 5"]
        },
        "stock":{
            type:[Number],
            required:true,
            validate: {
            validator: function (array) {
                return array.every(value => value >= 0);
            },
                message: "Stock cannot be less than 0",
            },
        },
        "brand":{
            type:String,
            required:true
        },
        "category":{
            type:String,
            required:true
        },
        "color":{
            type:String,
            required:true
        },
        "thumbnail":{
            type:String,
            required:true
        },
        "size":{
            type:[String],
            required:true
        },
        "images":{
            type:[String],
            required:true
        },
        "highlight":{
            type:[String],
            required:true
        },
        "detail":{
            type:String,
            required:true
        },
        "addedToCartByUsers":{
            type:[mongoose.Types.ObjectId],
        },
        "prodCode":{
            type:Number,
            require:true,
        },
        "unitsSold":{
            type:[Number],
            require:false
        }
    }
)

module.exports=mongoose.model("product",productSchema)