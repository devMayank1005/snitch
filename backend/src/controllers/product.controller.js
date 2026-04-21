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
      message: "Products fetched successfully",
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function getAllProducts(req, res) {
  try {
    const products = await Product.find()

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
export async function getProductDetails(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
  } catch (error) {
    console.error("Error in getProductDetails:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
export async function addProductVariant(req, res) {
  try {
    const productId = req.params.productId;

    const product = await Product.findOne({
        _id: productId,
        seller: req.user.userId || req.user.id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files;
    const images = [];
    if (files || files.length !== 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")

    console.log(price)

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes
    })

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })
  } catch (error) {
    console.error("Error in addProductVariant:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
