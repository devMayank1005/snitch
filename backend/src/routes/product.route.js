import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
	createProduct,
	getSellerProducts,
} from "../controllers/product.controller.js";
import multer from "multer";


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})
const router = express.Router();

router.post("/", requireAuth, requireRole("seller"), upload.array("images",7), createProduct);
router.get("/mine", requireAuth, requireRole("seller"), getSellerProducts);

export default router;