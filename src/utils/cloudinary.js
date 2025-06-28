import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// console.log("Cloudinary config:", cloudinary.config());

const uploadOnCLoudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        // console.log("file is upload on Cloudinary",response.url);
        fs.unlinkSync(localFilePath)
        return response;


    }
    catch (error){
        fs.unlinkSync(localFilePath)
        //remove the locally saved temporary file  as a upload operation got failed
        return null;
    }
}

export{uploadOnCLoudinary};