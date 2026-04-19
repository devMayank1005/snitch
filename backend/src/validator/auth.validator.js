import {body,validationResult} from "express-validator";
function validateRequest(req,res,next){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
export const validateRegister = [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("contact").notEmpty().withMessage("Contact is required").matches(/^[0-9]{10}$/).withMessage("Invalid contact number"),
    body("isSeller").optional().isBoolean().withMessage("Invalid seller status"),
   validateRequest
]