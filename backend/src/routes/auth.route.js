import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { validateRegister } from "../validator/auth.validator.js";
const router = Router();

router.post("/register", validateRegister, registerUser);

export default router;