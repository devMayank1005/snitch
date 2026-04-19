import {body,validationResult} from "express-validator";
function validateRequest(req,res,next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
export const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage("Password must include uppercase, lowercase, number, special char"),

  body("fullName")
    .notEmpty()
    .withMessage("Full name is required"),

  body("contact")
    .matches(/^[0-9]{10}$/)
    .withMessage("Invalid contact number"),

  body("isSeller")
    .optional()
    .toBoolean()
    .isBoolean(),

  validateRequest
];

