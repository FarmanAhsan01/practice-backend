import { asyncHandler } from "../utils/asynchHandler"
import {ApiError} from "../utils/ApiError"
import {ApiResponse} from "../utils/ApiResponse"
import { User } from "../models/user.models"
import {Comment} from "../models/comment.models"
import {Video} from "../models/video.models"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new ApiError(400,"video doesn't exist")
    }

    await Comment.aggregatePaginate(
       Comment.aggregate()
    )
    


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
    // TODO: delete a comment
    const {content}=req.body
    const {commentId}=req.params

    if(!content){
        throw new ApiError(400,"Comment is required")
    }

   const deleteComment= await Comment.findOneAndDelete(
        {
            _id:commentId , content:content,owner:req.user._id
        },
        {
            $unset:{
                content:null
            }
        },
        {new :true}
    )
    if(!deleteComment){
        throw new ApiError(400,"Comment doesn't delete successfully")
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,deleteComment,"delete comment successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }