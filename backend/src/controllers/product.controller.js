import Product from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

function parseJsonObject(input, fallback = {}) {
  if (!input) return fallback;
  if (typeof input === "object") return input;
  try {
    const parsed = JSON.parse(input);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function parseVariationStructure(rawValue) {
  if (!rawValue) return [];
  const parsed = Array.isArray(rawValue) ? rawValue : parseJsonObject(rawValue, []);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((key) => String(key || "").trim())
    .filter(Boolean);
}

function normalizeAttributes(rawAttributes) {
  const attrs = rawAttributes && typeof rawAttributes === "object" ? rawAttributes : {};
  const normalized = {};

  Object.entries(attrs).forEach(([rawKey, rawValue]) => {
    const key = String(rawKey || "").trim();
    const value = String(rawValue || "").trim();
    if (key && value) {
      normalized[key] = value;
    }
  });

  return normalized;
}

function toPlainObject(value) {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value.entries());
  if (typeof value.toObject === "function") return value.toObject();
  if (typeof value === "object") return { ...value };
  return {};
}

function buildCombinationKey(attributes, variationStructure = []) {
  const keys = variationStructure.length
    ? [...variationStructure]
    : Object.keys(attributes).sort((a, b) => a.localeCompare(b));

  return keys
    .map((key) => `${key}:${attributes[key] ?? ""}`)
    .join("|");
}

function validateVariationStructure(attributes, variationStructure) {
  if (!variationStructure.length) {
    return { valid: true };
  }

  const incomingKeys = Object.keys(attributes);
  const hasAllKeys = variationStructure.every((key) => incomingKeys.includes(key));
  const hasExtraKeys = incomingKeys.length !== variationStructure.length;

  if (!hasAllKeys || hasExtraKeys) {
    return {
      valid: false,
      message: `Variant attributes must exactly match variationStructure keys: ${variationStructure.join(", ")}`,
    };
  }

  return { valid: true };
}

function hydrateVariantCombinationKey(variant, variationStructure = []) {
  if (!variant) return "";

  const plainAttributes = normalizeAttributes(toPlainObject(variant.attributes));
  const combinationKey = String(
    variant.combinationKey ||
      buildCombinationKey(plainAttributes, variationStructure) ||
      (variant._id ? `legacy:${variant._id.toString()}` : "")
  ).trim();

  if (!variant.combinationKey && combinationKey) {
    variant.combinationKey = combinationKey;
  }

  return combinationKey;
}

async function uploadImages(files = []) {
  if (!files.length) return [];

  return Promise.all(
    files.map((file) =>
      uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
        folder: "snitch",
      })
    )
  );
}

function getVariantSummary(variants = []) {
  if (!variants.length) return "";

  const summaryMap = {};
  variants.forEach((variant) => {
    const attrs = variant.attributes || {};
    Object.entries(attrs).forEach(([key, value]) => {
      if (!summaryMap[key]) summaryMap[key] = new Set();
      summaryMap[key].add(value);
    });
  });

  return Object.entries(summaryMap)
    .map(([key, values]) => `${key}: ${Array.from(values).join(", ")}`)
    .join(" | ");
}

function uniqueVariantsByCombinationKey(variants = [], variationStructure = []) {
  const seen = new Set();
  const unique = [];

  for (const variant of variants) {
    const key = hydrateVariantCombinationKey(variant, variationStructure);
    const dedupeKey = key || variant?._id?.toString() || "";
    if (!dedupeKey || seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    unique.push(variant);
  }

  return unique;
}

export async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency, category, stock, variationStructure } = req.body;
    const sellerId = req.user.userId;

    const images = await uploadImages(req.files || []);
    const parsedVariationStructure = parseVariationStructure(variationStructure);

    const newProduct = await Product.create({
      title,
      description,
      price: {
        amount: Number(priceAmount) || 0,
        currency: priceCurrency || "INR",
      },
      category,
      stock: Math.max(0, Number(stock) || 0),
      seller: sellerId,
      images,
      variationStructure: parsedVariationStructure,
      variants: [],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getSellerProducts(req, res) {
  try {
    const sellerId = req.user.userId;

    const products = await Product.find({ seller: sellerId }).lean().sort({ createdAt: -1 });

    const enriched = products.map((product) => ({
      ...product,
      variants: uniqueVariantsByCombinationKey(product.variants || [], product.variationStructure || []),
      variantSummary: getVariantSummary(uniqueVariantsByCombinationKey(product.variants || [], product.variationStructure || [])),
    }));

    return res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      products: enriched,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getAllProducts(req, res) {
  try {
    const { category, search } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const products = await Product.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getProductDetails(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found", success: false });
    }

    product.variants = uniqueVariantsByCombinationKey(product.variants || [], product.variationStructure || []);

    return res.status(200).json({
      message: "Product details fetched successfully",
      success: true,
      product,
    });
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
      seller: req.user.userId || req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
        success: false,
      });
    }

    product.variants.forEach((variant) => {
      hydrateVariantCombinationKey(variant, product.variationStructure || []);
    });

    const attributes = normalizeAttributes(parseJsonObject(req.body.attributes, {}));
    const variationValidation = validateVariationStructure(attributes, product.variationStructure || []);
    if (!variationValidation.valid) {
      return res.status(400).json({ success: false, message: variationValidation.message });
    }

    const combinationKey = buildCombinationKey(attributes, product.variationStructure || []);
    if (!combinationKey) {
      return res.status(400).json({
        success: false,
        message: "Variant attributes must produce a valid combination key.",
      });
    }
    const normalizedVariants = uniqueVariantsByCombinationKey(product.variants || [], product.variationStructure || []);
    const exists = normalizedVariants.some((variant) => variant.combinationKey === combinationKey);
    if (exists) {
      return res.status(400).json({
        message: "A variant with this exact combination already exists.",
        success: false,
      });
    }

    const images = await uploadImages(req.files || []);
    const stock = Number(req.body.stock) || 0;
    const amount = Number(req.body.priceAmount);
    const hasPriceOverride = Number.isFinite(amount) && amount >= 0;

    product.variants = normalizedVariants;
    product.variants.push({
      sku: req.body.sku?.trim(),
      attributes,
      combinationKey,
      stock,
      images,
      price: hasPriceOverride
        ? {
            amount,
            currency: req.body.priceCurrency || product.price.currency,
          }
        : undefined,
      isActive: true,
    });

    await product.save();
    const savedVariant = product.variants[product.variants.length - 1];

    return res.status(200).json({
      message: "Product variant added successfully",
      success: true,
      product: savedVariant,
    });
  } catch (error) {
    console.error("Error in addProductVariant:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updateProductVariant(req, res) {
  try {
    const { productId, variantId } = req.params;
    const product = await Product.findOne({
      _id: productId,
      seller: req.user.userId || req.user.id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    product.variants.forEach((entry) => {
      hydrateVariantCombinationKey(entry, product.variationStructure || []);
    });

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    const normalizedVariants = uniqueVariantsByCombinationKey(product.variants || [], product.variationStructure || []);
    product.variants = normalizedVariants;

    const stockRaw = req.body.stock;
    if (stockRaw !== undefined) {
      variant.stock = Math.max(0, Number(stockRaw) || 0);
    }

    if (req.body.attributes !== undefined) {
      const attributes = normalizeAttributes(parseJsonObject(req.body.attributes, {}));
      const variationValidation = validateVariationStructure(attributes, product.variationStructure || []);
      if (!variationValidation.valid) {
        return res.status(400).json({ success: false, message: variationValidation.message });
      }

      const newCombinationKey = buildCombinationKey(attributes, product.variationStructure || []);
      if (!newCombinationKey) {
        return res.status(400).json({ success: false, message: "Variant attributes must produce a valid combination key." });
      }
      const duplicate = product.variants.some(
        (entry) => entry._id.toString() !== variantId && entry.combinationKey === newCombinationKey
      );
      if (duplicate) {
        return res.status(400).json({ success: false, message: "Duplicate variant combination" });
      }

      variant.attributes = attributes;
      variant.combinationKey = newCombinationKey;
    }

    const priceAmount = req.body.priceAmount;
    if (priceAmount !== undefined && priceAmount !== "") {
      const parsedAmount = Number(priceAmount);
      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({ success: false, message: "Invalid priceAmount" });
      }
      variant.price = {
        amount: parsedAmount,
        currency: req.body.priceCurrency || product.price.currency,
      };
    }

    if (req.body.isActive !== undefined) {
      variant.isActive = String(req.body.isActive) === "true" || req.body.isActive === true;
    }

    const images = await uploadImages(req.files || []);
    if (images.length) {
      variant.images = images;
    }

    await product.save();

    return res.status(200).json({ success: true, message: "Variant updated", product: variant });
  } catch (error) {
    console.error("Error in updateProductVariant:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function deleteProductVariant(req, res) {
  try {
    const { productId, variantId } = req.params;
    const product = await Product.findOne({
      _id: productId,
      seller: req.user.userId || req.user.id,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    product.variants.pull(variantId);
    await product.save();

    return res.status(200).json({ success: true, message: "Variant deleted" });
  } catch (error) {
    console.error("Error in deleteProductVariant:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function updateProduct(req, res) {
  try {
    const { productId } = req.params;
    const sellerId = req.user.userId || req.user.id;
    const { stock } = req.body;

    const product = await Product.findOne({ _id: productId, seller: sellerId });
    if (!product) {
      return res.status(404).json({
        message: "Product not found or unauthorized",
        success: false,
      });
    }

    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (!Number.isFinite(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ success: false, message: "Invalid stock value" });
      }
      product.stock = Math.floor(parsedStock);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function deleteProduct(req, res) {
  try {
    const productId = req.params.productId;
    const sellerId = req.user.userId || req.user.id;

    const product = await Product.findOne({ _id: productId, seller: sellerId });
    if (!product) {
      return res.status(404).json({
        message: "Product not found or you are not authorized to delete it",
        success: false,
      });
    }

    await Product.deleteOne({ _id: productId });

    return res.status(200).json({ message: "Product deleted successfully", success: true });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
