import Product from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency, category, variationStructure } = req.body;
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

    let parsedVariationStructure = undefined;
    if (variationStructure) {
        try { parsedVariationStructure = typeof variationStructure === 'string' ? JSON.parse(variationStructure) : variationStructure; } catch (e) {}
    }

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
      variationStructure: parsedVariationStructure,
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

    const baseProducts = await Product.find({ seller: sellerId, parentProductId: null }).lean().sort({
      createdAt: -1,
    });

    for (let i = 0; i < baseProducts.length; i++) {
        const variants = await Product.find({ parentProductId: baseProducts[i]._id }).lean();
        baseProducts[i].variants = variants; // Full variants
        
        if (variants.length > 0) {
           const summaries = {};
           variants.forEach(v => {
               if (v.attributes) {
                   Object.entries(v.attributes).forEach(([key, val]) => {
                       if (!summaries[key]) summaries[key] = new Set();
                       summaries[key].add(val);
                   });
               }
           });
           
           const summaryStrings = [];
           Object.entries(summaries).forEach(([key, set]) => {
               summaryStrings.push(`${key}: ${Array.from(set).join(', ')}`);
           });
           baseProducts[i].variantSummary = summaryStrings.join(' | ');
        }
    }

    return res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      products: baseProducts,
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
    const { category, search } = req.query;
    
    // Only return Base Products (null parent) on the Home Feed
    let query = { parentProductId: null };
    
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const products = await Product.find(query).sort({ createdAt: -1 });

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

    const baseProduct = await Product.findById(id).lean();

    if (!baseProduct) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    // Dynamic Database Stitching: Synthesize independent variants securely to match UI contracts
    const variants = await Product.find({ parentProductId: id }).lean();
    baseProduct.variants = variants;

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product: baseProduct
    })
  } catch (error) {
    console.error("Error in getProductDetails:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
export async function addProductVariant(req, res) {
  try {
    const productId = req.params.productId;

    const baseProduct = await Product.findOne({
        _id: productId,
        seller: req.user.userId || req.user.id
    });

    if (!baseProduct || baseProduct.parentProductId !== null) {
        return res.status(404).json({
            message: "Valid Base Product not found",
            success: false
        })
    }

    const files = req.files || [];
    const images = [];
    if (files.length > 0) {
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

    // 1. Structure Match Validation
    if (baseProduct.variationStructure && baseProduct.variationStructure.length > 0) {
        const requiredKeys = baseProduct.variationStructure;
        const incomingKeys = Object.keys(attributes);
        const hasAllKeys = requiredKeys.every(k => incomingKeys.includes(k));
        const hasExtraKeys = incomingKeys.length !== requiredKeys.length;
        if (!hasAllKeys || hasExtraKeys) {
            return res.status(400).json({
                message: `Variant attributes must perfectly match the base variationStructure keys: ${requiredKeys.join(', ')}`,
                success: false
            })
        }
    }

    // 2. Duplicate Combination Validation
    const existingVariants = await Product.find({ parentProductId: productId });
    for (const v of existingVariants) {
        if (v.attributes) {
            let isIdentical = true;
            for (const [k, val] of Object.entries(attributes)) {
                if (v.attributes.get(k) !== val) {
                    isIdentical = false;
                    break;
                }
            }
            if (isIdentical && Object.keys(attributes).length === Array.from(v.attributes.keys()).length) {
                return res.status(400).json({
                    message: "A variant with this exact combination of attributes already exists.",
                    success: false
                })
            }
        }
    }

    // 3. Create discrete Variant Product
    const newVariant = await Product.create({
        parentProductId: productId,
        title: baseProduct.title,
        description: baseProduct.description,
        category: baseProduct.category,
        seller: baseProduct.seller,
        price: {
            amount: Number(price) || baseProduct.price.amount,
            currency: req.body.priceCurrency || baseProduct.price.currency
        },
        stock: stock || 0,
        images,
        attributes
    });

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product: newVariant
    })
  } catch (error) {
    console.error("Error in addProductVariant:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function deleteProduct(req, res) {
  try {
    const productId = req.params.productId;
    const sellerId = req.user.userId || req.user.id;

    const product = await Product.findOne({
        _id: productId,
        seller: sellerId
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found or you are not authorized to delete it",
            success: false
        })
    }

    // Safety Protocol: Block Base Deletion if Orphans would be created
    if (product.parentProductId === null) {
        const variantCount = await Product.countDocuments({ parentProductId: productId });
        if (variantCount > 0) {
            return res.status(400).json({
                message: `Cannot delete Base Product. Please delete or reassign all ${variantCount} associated variants first.`,
                success: false
            })
        }
    }

    await Product.deleteOne({ _id: productId });

    return res.status(200).json({
        message: "Product deleted successfully",
        success: true
    })
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
