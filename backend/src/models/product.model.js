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
    parentProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },
    variationStructure: {
      type: [String],
      default: undefined, // E.g. ["Size", "Color"]. Base product only.
    },
    attributes: {
      type: Map,
      of: String, // E.g. { "Size": "M", "Color": "Black" }. Variant specific.
    },
    stock: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);  
export default mongoose.model("Product", productSchema);