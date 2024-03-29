import {v2 as cloudinary} from 'cloudinary';
// import { Console } from 'console';
import fs  from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary=async (localFilePath)=>{
    try{
        if(!localFilePath)return null //could not find the path
        //upload file on cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully   
        console.log("file has been uploaded on cloudinary",response.url)
        fs.unlinkSync(localFilePath)
        // console.log("last line")
        return response;
    }catch(error){
        //removing the files locally after uploading using unlink (synchronously)???? not done here yet

        console.log("in cloud",error)
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation failed
        return null;
    }
}
export {uploadOnCloudinary}

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });