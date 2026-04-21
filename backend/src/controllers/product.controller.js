import Product from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency,category } = req.body;
    const seller = req.user;
    const sellerId = seller.userId;

    const files = req.files || [];

    const images = await Promise.all(
      files.map(async (file) => {
        return await uploadFile({
          buffer: file.buffer,
          fileName: file.originalname,
          folder: "snitch",
        });
      })
    );

    const newProduct = await Product.create({
      title,
      description,
      price: {
        amount: priceAmount,
        currency: priceCurrency || "INR",
      },
      category,
      seller: sellerId,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function getSellerProducts(req, res) {
  try {
    const seller = req.user;
    const sellerId = seller.userId;

    const products = await Product.find({ seller: sellerId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}