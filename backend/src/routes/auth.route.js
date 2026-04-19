import { Router } from "express";
import { registerUser,loginUser } from "../controllers/auth.controller.js";
import { validateRegister } from "../validator/auth.validator.js";

const router = Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);

export default router;