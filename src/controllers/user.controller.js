import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
     //get user details from frontend
     //validation - NOT EMPTY
     //check if user  already exits:username ,email
      //check for images,check for avatar
      //upload them to cloudinary, avatar
      //create  user object  - create entry in db
      //remove password and refresh token field from response
      //check for user creation
      //return res

      const {fullName, email, username, password}=req.body
      // console.log("email: ",email);

      //old method to check condition

      // if(fullName==""){
      //   throw new ApiError(400,"full name is required")
      // }
      
      //some take call back it select all parameter and check together
      if([fullName, email, username, password].some((field)=>
        field?.trim() === ""
      )){
          throw new ApiError(400,"All field required")
      }

      //check if same user and email is access or not using models

      User.findOne({
        $or:[{
          username
        },
      {
        email
      }]
      })
      if(existedUser){
        throw new ApiError(409,"User with this email or username already exist")
      }
     
      const avatarLocalPath=req.files?.avatar[0].path;
       const coverLocalPath=req.files?.cvoverImage[0].path;

       if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
       }

      const avatar=await uploadOnCLoudinary(avatarLocalPath)
      const coverImage=await uploadOnCLoudinary(coverLocalPath)

      if(!avatar){
        throw new ApiError(400,"Avatar file is required")
      }
      const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
      })

    // when we create user it give every element _id so we can find user is created or not by finding id

     const createdUser=await User.findById(user._id).select(
      "-password -refreshToken"
     )

     if(!createdUser){
      throw new ApiError(500,"something went wrong while registering the user")
     }

     return res.status(201).jason(
      new ApiResponse(200,createdUser,"User registerd Successfully")
     )
})
export {registerUser}