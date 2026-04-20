import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      amount: {type: Number,
      required: true,
      }, 
      currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "JPY", "CNY","INR"],
        default: "INR",
      },
    },
    category: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [
      {
        url: String,
        publicId: String, // For cloud storage reference
      },            
    ],
  },
  {
    timestamps: true,
  }
);  
export default mongoose.model("Product", productSchema);