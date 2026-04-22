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
    variants: [
      {
        images: [
          {
            url: String,
            publicId: String,
          },
        ],
        price: {
          amount: Number,
          currency: {
            type: String,
            default: "INR",
          },
        },
        stock: {
          type: Number,
          default: 0,
        },
        attributes: {
          type: Map,
          of: String, // e.g. { "Size": "M", "Color": "Black" }
        },
      },
    ],
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