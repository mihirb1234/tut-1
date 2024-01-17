//verfiy if user there or not

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {User} from '../models/user.model.js'
import jwt from "jsonwebtoken"


// next agle middlware me leke jayga 
export const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
    const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");//agar cookies nhi hai toh header se token nikalenge
 
 
    if(!token){//agar token nhi hai
     throw new ApiError(401,"Unauthorized request")
    }
 
    //if token exists use jwt to check if token is sahi ya nhi
 // UserSchema.methods.generateAccessToken=async function(){
 //     return await jwt.sign(
 //         {
 //             _id:this._id,
 //             email:this.email,
 //             username:this.username,
 //             fullname:this.fullname
 //         },
 //         process.env.ACCESS_TOKEN_SECRET,
 //         {
 //             expiresIn:process.env.ACCESS_TOKEN_EXPIRY
 //         }
 //     )
 // }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
    const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
 
    if(!user){
     throw new ApiError(401,"Invalid access token")  
    }
    req.user=user; //this is what we are doing (MAIN OBJECTIVE IS TO MAKE the user.req as per the above changes accordingly)
    next()
    
 
   } catch (error) {
        throw new ApiError(401,error?.message ||"invalid access token")
   }

})