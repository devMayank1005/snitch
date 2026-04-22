import { requireAuth } from "../middlewares/auth.middleware.js"
import { createProduct, getAllProducts, getSellerProducts, getProductDetails, addProductVariant, deleteProduct } from "../controllers/product.controller.js"

import express from 'express'
import multer from 'multer'

const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
})

router.post("/create", requireAuth, upload.array('images', 5), createProduct);

router.post("/:productId/variants", requireAuth, upload.array('images', 5), addProductVariant);

router.get("/seller", requireAuth, getSellerProducts);

router.delete("/:productId", requireAuth, deleteProduct);

router.get("/detail/:id", getProductDetails);
router.get("/", getAllProducts);

export default router;
