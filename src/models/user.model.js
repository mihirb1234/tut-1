import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema =new Schema({
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            
        },
        fullname:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true,
            
        },
        avatar:{
            type:String,
            required:true,
        },
        coverImage:{
            type:String,

        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,'Password is required']
        },
        refreshToken:{
            type:String
        }

},{timestamps:true})

//hook to hash your passwd using a middleware pre

//next matlab aage pass krdo
userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();//check kab kab hash zaruri hai ex updating creating modifying
    this.password=await bcrypt.hash(this.password,10) //awaut passeord hash hone ke pehle time lagega thats why await
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=async function(){
    return await jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=async function(){
    return await jwt.sign(
        {
            _id:this._id,
            // email:this.email,
            // username:this.username,
            // fullname:this.fullname  no need 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User=mongoose.model("User",userSchema);