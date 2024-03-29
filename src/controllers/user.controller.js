import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.model.js";

import {uploadOnCloudinary} from '../utils/cloudinary.js'

import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();

        //document object ke andar ham refresh token daal rhe hai
        //basically we are seeing the properties in usermodel we see refresh token and now user data base me daal denge

       user.refreshToken=refreshToken; 
       await user.save({validateBeforeSave:false});//save in db ..validate before save means baaki saare fields from usermodel jaise passwoed username watchHistory, you DONT save them 

       return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"somehing went wrong while generating referesh and access token")
    }
}

const registerUser=asyncHandler(async(req,res)=>{
    // return res.status(200).json({
    //     message:"ok"
    // })

    //get user detais from frontend
    //validation-not empty kuch emppty nhhi hona chaiye
    //check if user alreasy exists --using email or usename
    //check for images ,check for avatar
    //upload them to cloudinary--reference lelo and then url return hoga
    //create user object --> mongodb me object leta hai ->create entry in db
    //remove password and refresh token(usually empty field) field from response
    //check for user creation
    //return response
    //return res

    //step-1 -take data from req body -->destructure (from usermodel see what all you need)
    const {fullname,email,username,password}=req.body
    // console.log("email: ",email)
    
     
    //validation
    if(fullname===""){
        throw new ApiError(400,"fullname is required")
    }
    if(email===""){
        throw new ApiError(400,"email is required")
    }
    if(username===""){
        throw new ApiError(400,"username is required")
    }
    if(password===""){
        throw new ApiError(400,"password is required")
    }
     console.log(1);
    // step-3 check if user already exists or not
    //import User form  userModel  user can directly contact with the database

    //ask database if user's email matches with the one being entered

    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        //409
        throw new ApiError(409,"User with this username or password already exists")
    }
   
    console.log(2);
    //step-4 check for files

    //express hame --> req.body ka access deta hai
    // multer hame req.files ka access deta hai

    //hosakta acccess ho ya na bhi ho 

    //avatar[0] first property ke andar ek object milta hai uske andar ek optional
    //AvatarLocalPath local path kyu kyuki ye apne server pr gya hai(local) and not on cloudinary
    console.log(req.files)
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
     
    //step-5 upload them to cloudinary

    // await uploadOnCloudinary(avatarLocalPath); asynchronous hai matlab time leta hai so we have to await
    //cuz we dont eant things to proceed without uploading the image on cloudinary

    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar files is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        // throw new ApiError(400,"avatar file is required")
    }


    //step-6 entry into the database --> database me entry me require some time thats why we await
    const user=await User.create({
        fullname,
        avatar:avatar?.url,
        //coverImage ka check nhi jra so... hoga to url dedo otherwise an empty string
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
        //refresh token data base me nahi daalenge we need that to be empty
    })

    //STEP-7
    //check  if user created
    //mongoDB automatically har ek entry ke saath ek Id laga deta hai _id   
    //user._id mila toh user creatrd
    const createdUser= await User.findById(user._id).select(
    //     //agar user mila hai toh ye do fields select hoke NAHI AYENGE
        "-password -refreshToken"  
    )

    // return res.status(200).json({
    //     success:true,
    //     user
    // })

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering a user")
    }

    //STEP-8 API RESPONSE
    //must be structured properly so we use 

    return res.status(201).json(
        new ApiResponse(200,createdUser,"USER REGISTERED SUCCESSFULLY")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    //todos??
    //req.body bnao username /email dono eksath bhi chala skte
    //find the user
    //password check 
    //access and refresh token generate and send to the user
    //send secure cookies

    const {email,username,password}=req.body
    if(!(username  || email)){
        throw new ApiError(400,"username or password is required")
    }
    const user =await user.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    //User mongodb object
    //user instance hai 
    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(404,"user doesnt exist")
    }
    

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

    //user ko konsi info bhejni---->cookies me bhejo --->eg password,refreshtoken mt bhejo


    const loggedInUser=await User.findById(user._id).select("-password","-refreshToken");

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user logged in successfully"

        )
    )


    
})
const logoutUser=asyncHandler(async(req,res)=>{
    //cookies clear 
    //refresh token ko bhi change krna hoga in order to logout

    // req.user._id

   await User.findByIdAndUpdate(
         req.user._id,   
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true //new updated value milegi, old matlab refresh token bhi aajayga jo hamara objective hai logout ke time hatana
        }

    )

    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))

    
})

export {registerUser
,loginUser,logoutUser}