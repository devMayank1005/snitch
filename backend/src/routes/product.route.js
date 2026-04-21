import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { createProduct, getAllProducts, getSellerProducts, getProductDetails, addProductVariant } from '../controllers/product.controller.js';
import multer from "multer";
import { createProductValidation } from "../validator/product.validator.js"; // Import the createProductValidation from "../validator/product.validator.js";


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})
const router = express.Router();

router.post("/", requireAuth, requireRole("seller"),upload.array("images",7), createProductValidation ,createProduct);
router.get("/seller", requireAuth, requireRole("seller"), getSellerProducts);
/**
 * @route GET /api/products
 * @description Get all products
 * @access Public
 */
router.get("/", getAllProducts);


/**
 * @route GET /api/products/detail/:id
 * @description Get product details by ID
 * @access Public
 */
router.get("/detail/:id", getProductDetails)


/**
 * @route post /api/products/:productId/variants
 * @description Add a new variant to a product
 * @access Private (Seller only)
 */
router.post("/:productId/variants", requireAuth, requireRole("seller"), upload.array('images', 7), addProductVariant)

export default router;
