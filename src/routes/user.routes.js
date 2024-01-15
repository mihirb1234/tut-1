import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router()

router.route("/register").post(
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

export default router