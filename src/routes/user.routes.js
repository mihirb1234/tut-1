import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router()

router.route("/register").post(

//middleware inject, method
//eg middleware,registerUser

    //middleware injection for file upload  
    upload.fields([
        {
            name:"avatar",//frontend ke field me bhi file avatar
            maxCount:1 //kitne file accept kregaa
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
// router.route("/login").post(login)

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(verifyJWT,logoutUser); 

export default router