import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCLoudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        console.log("file is upload on Cloudinary",response.url);
        return response;
    }
    catch (error){
        fs.unlinkSync(localFilePath)
        //remove the locally saved temporary file  as a upload operation got failed
        return null;
    }
}

export{uploadOnCLoudinary};