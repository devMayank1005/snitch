import Product from "../models/product.model.js";
import { CartModel } from "../models/cart.model.js";

export function findProductByIdLean(productId) {
  return Product.findById(productId).lean();
}

function normalizeKey(value) {
  return value ? String(value) : "base";
}

async function getReservedQuantityMapForProductIds(productIds = []) {
  const ids = productIds.map((id) => String(id)).filter(Boolean);
  if (!ids.length) return new Map();

  const carts = await CartModel.find({ "items.product": { $in: ids } }).select("items").lean();
  const reservedMap = new Map();

  for (const cart of carts) {
    for (const item of cart.items || []) {
      const productId = item?.product ? String(item.product) : "";
      if (!productId || !ids.includes(productId)) continue;

      const variantKey = normalizeKey(item.variantId);
      const qty = Math.max(0, Number(item.quantity) || 0);
      if (!qty) continue;

      const productEntry = reservedMap.get(productId) || { base: 0, variants: new Map() };
      if (variantKey === "base") {
        productEntry.base += qty;
      } else {
        productEntry.variants.set(variantKey, (productEntry.variants.get(variantKey) || 0) + qty);
      }
      reservedMap.set(productId, productEntry);
    }
  }

  return reservedMap;
}

function applyAvailability(product, reservedMap) {
  if (!product) return null;

  const productId = String(product._id);
  const reserved = reservedMap.get(productId) || { base: 0, variants: new Map() };
  const baseStock = Math.max(0, Number(product.stock) || 0);
  const availableBaseStock = Math.max(0, baseStock - reserved.base);

  const variants = (product.variants || []).map((variant) => {
    const variantStock = Math.max(0, Number(variant.stock) || 0);
    const variantId = String(variant._id);
    const reservedVariantQty = reserved.variants.get(variantId) || 0;

    return {
      ...variant,
      availableStock: Math.max(0, variantStock - reservedVariantQty),
    };
  });

  return {
    ...product,
    availableStock: availableBaseStock,
    variants,
  };
}

export async function findProductByIdWithAvailability(productId) {
  const product = await Product.findById(productId).lean();
  if (!product) return null;

  const reservedMap = await getReservedQuantityMapForProductIds([product._id]);
  return applyAvailability(product, reservedMap);
}

export async function findProductsWithAvailability(query = {}, sort = { createdAt: -1 }) {
  const products = await Product.find(query).sort(sort).lean();
  if (!products.length) return [];

  const reservedMap = await getReservedQuantityMapForProductIds(products.map((product) => product._id));
  return products.map((product) => applyAvailability(product, reservedMap));
}

export async function applyAvailabilityToProducts(products = []) {
  if (!products.length) return [];
  const reservedMap = await getReservedQuantityMapForProductIds(products.map((product) => product._id));
  return products.map((product) => applyAvailability(product, reservedMap));
}
