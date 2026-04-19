/**
 * email
 * contact 
 * password
 * full name
 */
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export async function sendTokenResponse(user,statusCode,res){
   const token = jwt.sign({id:user._id},config.jwtSecret,{expiresIn:config.jwtExpire});
   res.cookie("token",token,
    {httpOnly:true,
        secure:true,
        maxAge:60*60*1000
    });
  res.status(statusCode).json({
    message:"User registered successfully",
    success:true,
    user:{
        _id:user._id,
        email:user.email,
        contact:user.contact,
        fullName:user.fullName,
        role:user.role
    }
  });
}
export const registerUser = async (req, res) => {
    const {email,contact,password,fullName,isSeller} = req.body;
    try {
        const userExists = await UserModel.findOne({$or:[{email},{contact}]});
        if(userExists){
            return res.status(400).json({message:"User already exists"});
        }
        
        const user = await UserModel.create({
            email,
            contact,
            password,
            fullName,
            role:isSeller ? "seller" : "buyer"
        });
        await sendTokenResponse(user,201,res,"User registered successfully");
    } catch(error){
        return res.status(500).json({message:"Internal server error"});
    }
};
