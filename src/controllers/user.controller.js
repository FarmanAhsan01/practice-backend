import { asyncHandler } from "../utils/asynchHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { response } from "express";
import mongoose from "mongoose";

const genrateAccessTokenAndRefreshToken=async(userId)=>{
     try {
      const user =await User.findById(userId)
      const accessToken=user.genrateAccessToken()
      const refreshToken=user.genrateRefreshToken()

      user.refreshToken= refreshToken
        // console.log("A and R->",accessToken,refreshToken);
      await user.save({ValidateBeforeSave:false})
    
  
      
      return{accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"something went  wrong while  generating refresh and access token ")
  }
}


const loginUser=asyncHandler(async(req,res)=>{

    //get user detals 
    //username or email
    //find the user
    //password check
    //access  and refresh token 
    //send cookie
  const{email,username,password}=req.body
  if(!username && !email){
    throw new ApiError(400,"username or email is required")
  } 

 const user=await User.findOne({
  $or:[{username},{email}]
 })

 if(!user){
  throw new ApiError(404,"user does not exist")
 }
//  console.log("user: ",user)

 const isPasswordValid=await user.isPasswordCorrect(password) 
 if(!isPasswordValid){
  throw new ApiError(404,"invalid User Credentials")
 }


 const {accessToken,refreshToken}=await genrateAccessTokenAndRefreshToken(user._id)
 const loggedInUser=await User.findById(user._id).
 select("-password -refreshToken")
//not frontend can access accessTOken and refresah Token
 const options={
  httpOnly:true,
  secure:true
 }
//  console.log("accessToken ,refreshToken",accessToken,refreshToken);
 
 return res 
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 
 .json(
   new ApiResponse(
    200,
    {
      user:loggedInUser,accessToken,refreshToken
      

    },
    "User Logged in Successfully"
   )
 )



})

const logoutUser=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset:{
          refreshToken:1
        }
      },
      {
        new:true
      }
    ) 
     const options={
         httpOnly:true,
         secure:false
     }

     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200,{},"User Logged Out"))
})




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

      const existedUser=await User.findOne({
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

      //  const coverLocalPath=req.files?.coverImage[0].path;

      let  coverLocalPath;
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
         coverLocalPath=req.files.coverImage[0].path;
      }


       if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required")
       }
      //  console.log("File Recieve",avatarLocalPath);

      const avatar=await uploadOnCLoudinary(avatarLocalPath)
      const coverImage=await uploadOnCLoudinary(coverLocalPath)

      // console.log("FILES RECEIVED >>> ", avatar);

      if(!avatar){
        throw new ApiError(400,"Avatar File is required")
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

     return res.status(201).json(
      new ApiResponse(200,createdUser,"User registerd Successfully")
     )
})

const refrehAccessToken= asyncHandler(async(req,res)=>{
  //cookie for use laptop and body is use when user use mobile
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
      throw new ApiError(401,"unauthorized request")
  }
 try {
   const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
   const user= await User.findById(decodedToken?._id) 
   if(!user){
       throw new ApiError(401,"Invalid refresh token")
   }
 
   if(incomingRefreshToken!==user?.refreshToken){
     throw new ApiError(401,"Refresh token is expired or used ")
   }
 
    const options={
     httpOnly:true,
     secure:true
    }
    const {accessToken,newrefreshToken}=await genrateAccessTokenAndRefreshToken(user._id)
    return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newrefreshToken,options)
     .json(
       new ApiResponse(
         200,
         {accessToken,refreshToken:newrefreshToken},
         "Access token refreshed"
       )
     )
 } catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresh token")
 }
   
})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {password,newPassword}=  req.body

  //so we change the password it mean already login so it mean it auth middle middlewear where we asign req.user=user
 const user= await User.findById(req.user?._id)
 const isPasswordCorrect=await user.isPasswordCorrect(password)
 if(!isPasswordCorrect){
  throw new ApiError(400,"Invalid old password")
 }
 user.password=newPassword
 await user.save({validateBeforeSave:false})
                                                                             
 return res
 .status(200)
 .json(new ApiResponse(200,{},"password change successfully"))
})


const getCurrentUser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current user fetch successfully")
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body
    
  if(!(fullName||email)){
    throw new ApiError(400,"All fields are required")
  }
   console.log(email,fullName)
 

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email:email
      }
    },
    {new:true}

  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account details update successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
   const avatarLocalPath= req.file?.path
  //  console.log(avatarLocalPath)
   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
   }

   const avatar=await uploadOnCLoudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400,"Error while uploading on avatar")
   }

   const newAvatar=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar : avatar.url
      }
    },
    {new : true}
   ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,newAvatar,"Avatar update successfully"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const covarImageLocalPath=req.file?.path
  if(!covarImageLocalPath){
    throw new ApiError(400,"coverImage file is missing")
  }

  const coverImage=await uploadOnCLoudinary(covarImageLocalPath)
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading on coverImage")
  }

  const newCoverImage=await User.findByIdAndUpdate(
    req.user?._id,
    {
      coverImage:coverImage.url
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200,newCoverImage,"CoverImage upload successfuly"))

})

const getUserChennalProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions", // ✅ corrected
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions", // ✅ corrected
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelSubscriberCount: { $size: "$subscribedTo" },
        isSubscribe: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscriberCount: 1,
        isSubscribe: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ]);

  if (!channel.length) {
    throw new ApiError(404, "channel does not exist");
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});


const getWatchHistory = asyncHandler(async (req, res) => {
  const userHistory = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: { $first: "$owner" } // flatten owner array
            }
          },
          {
            $project: {
              videoFiles: 1,
              thumbNail: 1,
              title: 1,
              description: 1,
              duration: 1,
              views: 1,
              isPublished: 1,
              createdAt: 1,
              owner: 1
            }
          }
        ]
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, userHistory[0]?.watchHistory || [], "Watch history fetched successfully")
  );

});




export {
  registerUser,
  loginUser,
  logoutUser,
  refrehAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChennalProfile,
  getWatchHistory

}