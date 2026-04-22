import { requireAuth } from "../middlewares/auth.middleware.js"
import { requireRole } from "../middlewares/role.middleware.js";
import { createProduct, getAllProducts, getSellerProducts, getProductDetails, addProductVariant, deleteProduct } from "../controllers/product.controller.js"

import express from 'express'
import multer from 'multer'

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 7 * 1024 * 1024,
    }
})

router.post("/create", requireAuth, requireRole("seller"), upload.array('images', 7), createProduct);

router.post("/:productId/variants", requireAuth, requireRole("seller"), upload.array('images', 7), addProductVariant);

router.get("/seller", requireAuth, requireRole("seller"), getSellerProducts);

router.delete("/:productId", requireAuth, requireRole("seller"), deleteProduct);

router.get("/detail/:id", getProductDetails);
router.get("/", getAllProducts);

export default router;
