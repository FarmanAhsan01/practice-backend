import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId||!isValidObjectId){
        throw new ApiError(400,"video is required")
    }
    const userId=req.user?._id
    //check if user already liked video
    const existedUser=await Like.findOne(
        {
            video:videoId,
            likedBy:userId
        },
    )
    let message="";
    //if user already like --> remove like
    if(existedUser){
        await Like.deleteOne()
        message="Like deleted"
    }
    else{
        await Like.create({
            video:videoId,
            likedBy:userId
        
        })
          message = "Like added";
    }

    return res
    .status(200)
    .json(200,null,message)

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId||!isValidObjectId){
        throw new ApiError(400,"comment is required")
    }

    const userId=req.user?._id

    const existed=await Like.findOne(
        {
            comment:commentId,
            likedBy:userId
        }
    )
    let message="";
    if(existed){
        await Like.deleteOne()
        message="Comment like deleted"
    }
    else{
        await Like.create({
            comment:commentId,
            likedBy:userId
        })
        message="comment like addded"
    }
    return res
    .status(200)
    .json(new ApiResponse(200,null,message))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId||!isValidObjectId){
        throw new ApiError(400,"tweet is reqired")
    }
    const userId=req.user?._id

    const existed=await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    })
    let message=""
    if(existed){
       await Like.deleteOne()
       message="like remove"
    }
    else{
        await Like.create({
            tweet:tweetId,
            likedBy:userId
        })
        message="like added"
    }

    return res 
    .status(200)
    .json(new ApiResponse(200,null,message))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }
   const getVideos= await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(userId)
            },

        },
        {

            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"user",
                        pipeline:[
                            {
                                $project:{
                                    username:1,
                                    fullName:1,
                                    avatar:1,
                                    coverImage:1,
                                    video:1
                                },
                            },
                        ],
                            
                    },
                },
            ],
                
            },
        },

        {
            $unwind:"$video"
        },
        {
            $unwind:"$video.user"
        },
        {
            $project:{
                _id:0,
                video:1
            }

        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,getVideos,"Like video fetch successfully"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}