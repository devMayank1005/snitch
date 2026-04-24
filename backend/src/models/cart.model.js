import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    itemKey: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    priceSnapshot: {
      amount: { type: Number, required: true },
      currency: { type: String, required: true },
    },
    attributesSnapshot: {
      type: Map,
      of: String,
      default: {},
    },
    stockSnapshot: Number,
    titleSnapshot: String,
    imageSnapshot: String,
    snapshotCreatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const CartModel = mongoose.model("Cart", cartSchema);
