import { asyncHandler } from "../utils/asynchHandler"
import {ApiError} from "../utils/ApiError"
import {ApiResponse} from "../utils/ApiResponse"
import { User } from "../models/user.models"
import {Comment} from "../models/comment.models"
import {Video} from "../models/video.models"
import mongoose from "mongoose"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400,"video doesn't exist")
    }

   const aggregation  =await Comment.aggregate([
         {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $unwind:"owner"
        },
        {
            $project:{
                content:1,
                createdAt:1,
                owner:{
                    _id:1,
                    username:1,
                    fullName:1,
                }
            }
        },
   ] )
   
    options={
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const getComments = await Comment.aggregatePaginate(aggregation, options);
    return res
    .status(200)
    .json(new ApiResponse(200,getComments,"Video comments fetched successfully"))
    


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
   const{content,videoId}=req.body

   if(!content||!videoId){
    throw new ApiError(400,"conent and video are required")
   }

   const videoExist=await Video.findById(videoId)

   if(!videoExist){
    throw new ApiError(400,"video not found")
   }
    const comment=await  Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })
     return res
    .status(200)
    .json(new ApiResponse(200,comment,"Add comment successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const{content}=req.body
    const {commentId}=req.params
    if(!content){
        throw new ApiError(400,"Comment is required")
    }
    const updatedComment = await Comment.findOneAndUpdate(
        {  _id:commentId,  owner:req.user._id},
    
        {
        $set:{
            content
        }
    },{new:true})
    if(!updatedComment){
        throw new ApiError(400,"Comment not found or unauthorized")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedComment,"Update comment successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // 🔍 Validate input
  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  const userId = req.user?._id;

  // 🗑️ Delete the comment owned by the user
  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: userId,
  });

  // 🛑 If not found or already deleted
  if (!deletedComment) {
    throw new ApiError(404, "Comment not found or already deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }