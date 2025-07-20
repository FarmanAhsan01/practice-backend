import mongoose, { isValidObjectId } from "mongoose"
import { asyncHandler } from "../utils/asynchHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.models";
import {Tweet} from "../models/tweet.model.js"

const createTweet=asyncHandler(async(req,res)=>{
    // createTweet
    const{content}=req.body
    if(!content||!isValidObjectId){
        throw new ApiError(400,"Tweet is required")
    }
    const getTweet=await Tweet.create(
        {
          owner,
          content  
        }
    )
    if(!getTweet){
        throw new ApiError(400,"tweet do not create successfully")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,getTweet,"Add Tweet successfully"))

})


const getUserTweets=asyncHandler(async(req,res)=>{
    //getUserTweets
    const{TweetId}=req.params

    if(!TweetId){
        throw new ApiError(400,"Tweet is required")
    }
    const user=req.user?._id
    const tweet=await Tweet.findOne(
        {
            owner:user,
            _id:TweetId
        }
    )
    if(!getTweet){
        throw new ApiError(400,"Tweet not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"User Tweet fetched successfully"))
})


const upadateTweet=asyncHandler(async(req,res)=>{
    //updateTweet
    const{content}=req.body
    const{TweetId}=req.params
    if(!content){
        throw new ApiError(400,"Tweet is required for update")
    }
    const userId=req.user?._id
    const newTweet=await Tweet.findOneAndUpdate(
        {
           _id:TweetId,
           owner:userId
        },
        {
            $set:{
                content
            }
        },
        { new:true }
    )
    if(!newTweet){
        throw new ApiError(400,"Tweet not found or not updated")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,newTweet,"Tweet successfully updated"))
})

const deleteTweet=asyncHandler(async(req,res)=>{
    const{content}=req.body
    const{TweetId}=req.params

    if(!content){
        throw new ApiError(400,"content is required for delete")
    }

    const userId=req.user?._id
    const TweetDelete=await Tweet.findOneAndDelete(
        {
              _id: TweetId,
               owner: userId,
        }
        
    )
    if(!TweetDelete){
        throw new ApiError(400,"Tweet doesn't delete successfully")
    }
    return res
    .status(200)
    .json(200,TweetDelete,"Tweet delete fetched successfully")

})

//deleteTweet
export{
    createTweet,
    getUserTweets,
    upadateTweet,
    deleteTweet
}
