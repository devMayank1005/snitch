import dotenv from "dotenv";
dotenv.config();
if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined");
}
if(!process.env.MONGODB_URI){
    throw new Error("MONGODB_URI is not defined");
}
if(!process.env.JWT_EXPIRE){
    throw new Error("JWT_EXPIRE is not defined");
}
if(!process.env.NODE_ENV){
    throw new Error("NODE_ENV is not defined");
}
if(!process.env.PORT){
    throw new Error("PORT is not defined");
}
export const config = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,
};
