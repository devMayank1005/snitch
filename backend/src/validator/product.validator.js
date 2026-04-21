import {body, validationResult} from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }
    next();
}   

export const createProductValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({min: 3})
        .withMessage("Title must be at least 3 characters"),
    
    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required")
        .isLength({min: 10})
        .withMessage("Description must be at least 10 characters"),
    
    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required"),
    
    body("priceAmount")
        .notEmpty()
        .withMessage("Price amount is required")
        .isFloat({gt: 0})
        .withMessage("Price amount must be a positive number"),

    body("priceCurrency")
        .optional()
        .isString()
        .withMessage("Price currency must be a string"),

    validateRequest,
];