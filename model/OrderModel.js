const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  "name":{
      type:String,
      required:true
  },
  "email":{
      type:String,
      required:true
  },
  "phoneNumber":{
      type:String,
      required:true,
  },
  "address":{
      type:[Object],
      required:false,
  },
  "productsPurchased":{
      type:[Object],
      required:false,
  },
  "productsReturned":{
    type:[Object],
    required:false,
  },
  "productsReplaced":{
    type:[Object],
    required:false,
  },
  "finalPurchase":{
    type:[Object],
    requires:false
  },
  "replacementRequestRaised":{
    type:Boolean,
    require:false,
    default:false
  },
  "totalProductsValue":{
      type:Number,
      required:true
  },
  "dateOfPurchase":{
      type:Date,
      required:true
  },
  "dateOfDispatch":{
      default:null,
      type:Date
  },
  "dateOfDelivery":{
      type:Date,
      default:null
  },
  "status":{
      type:String,
      required:true
  },
  "paymentDetails":{
      type:Object,
      required:true
  },  
  invoiceNumber: {
    type: Number,
    default:0,
    required: true
  },
  tax:{
    required:true,
    type:Number,
  },
  shippingCharges:{
    require:true,
    type:Number
  },
  totalValue:{
    require:true,
    type:Number
  },
});

// Create a Pre-save Middleware Hook
orderSchema.pre('save', async function(next) {
  const doc = this;
  if (!doc.invoiceNumber) {
    try {
      // Find and update the sequence value
      const sequence = await Sequence.findByIdAndUpdate(
        { _id: 'invoice_sequence' }, // Use a unique identifier for your sequence
        { $inc: { sequence_value: 1 } }, // Increment the sequence value
        { new: true, upsert: true } // Create the sequence if it doesn't exist
      );

      // Set the invoice number
      doc.invoiceNumber = sequence.sequence_value;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports=mongoose.model("orders",orderSchema)


// const mongoose=require("mongoose");
// const orderSchema = new mongoose.Schema(
//     {
//         "userId":{
//             type:mongoose.Types.ObjectId,
//             required:true
//         },
//         "name":{
//             type:String,
//             required:true
//         },
//         "email":{
//             type:String,
//             required:true
//         },
//         "phoneNumber":{
//             type:String,
//             required:true,
//         },
//         "address":{
//             type:[Object],
//             required:false,
//         },
//         "productsPurchased":{
//             type:[Object],
//             required:false,
//         },
//         "totalValue":{
//             type:Number,
//             required:true
//         },
//         "dateOfPurchase":{
//             type:Date,
//             required:true
//         },
//         "dateOfDispatch":{
//             default:null,
//             type:Date
//         },
//         "dateOfDelivery":{
//             type:Date,
//             default:null
//         },
//         "status":{
//             type:String,
//             required:true
//         },
//         "paymentDetails":{
//             type:Object,
//             required:true
//         }
//     }
// )

// module.exports=mongoose.model("orders",orderSchema)