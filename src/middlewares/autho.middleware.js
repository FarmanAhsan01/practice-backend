import { asyncHandler } from "../utils/asynchHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

 export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }

        // console.log("token",token);
        
        
       const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
       const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
    
       if(!user){
        throw new ApiError(401,"Invalid AccessToken")
       }
       req.user=user;
       next()
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid access Token")
    }  
})

