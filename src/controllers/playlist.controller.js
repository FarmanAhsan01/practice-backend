import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import {Video} from "../models/video.models"
import { Playlist} from "../models/playlist.models.js"
import { isValidObjectId } from "mongoose"
import { deleteVideo } from "./video.controller.js"
import { use } from "react"

//createPlayList
const createPlayList=asyncHandler(async(req,res)=>{
    const {name,description,videos=[]}=req.body

    if(!name?.trim){
        throw new ApiError(400,"Playlist name is required")
    }

    if(!Array.isArray(videos)){
        throw new ApiError(400,"video must be in array")
    }
    const userId=req.user?._id

    const playlist=await Playlist.create(
        {
            owner:userId,
            name,
            description,
            videos
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist create successfully"))
    
})
const getUserPlayLists=asyncHandler(async(req,res)=>{
    const{userId}=req.params
    if(!userId){
        throw new ApiError(400,"unauthorized: user not found")
    }
    const playList=await Playlist.findOne(
        {
            owner:userId
        }
    ).populate("videos","title thumbnail")
    .select("name description videos createdAt updatedAt")

    return res
    .status(200)
    .json(new ApiResponse(200,playList,"User playlist fetched successfully"))
})
//getUserPlayLists


const getPlayListByID=asyncHandler(async(req,res)=>{
    //getPlayListByID
    const{playlistId}=req.params
    if(!playlistId){
        throw new ApiError(400,"PlaylistId required")
    }
    const userId=req.user?._id
    const result=await Playlist.aggregate([
         {
           $match:{
            _id:new mongoose.Types.Objectid(playlistId),
            owner:userId
           }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"video"
            }
        },
        {
            $prject:{
            name:1,
            description:1,
            thumbnail:1,
            title:1,
            video:1
        }
    }
    ])
       if (!result || result.length === 0) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200,result[0],"Fetch playlist with video"))

})

const addVideoToPlayList=asyncHandler(async(req,res)=>{
    //addVideoToPlayList 
    const {videoId,playlistId}=req.params
    if(!videoId||!playlistId){
        throw new ApiError(400,"VideoId and playlistId is required")
    }
    const userId=req.user?._id
    if(!mongoose.isValidObjectId(videoId)||!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid Id format")
    }

    const playlist=await Playlist.findOne({
        _id:playlistId,
        owner:userId
    })
    if(!playlist){
        throw new ApiError(404,"playlist not found unauthorized access")
    }

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400,"Video already exists in playlist")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Video added to playlist successfully"))
})

//removeVideoFromPlaylist  
const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const{videoId,playlistId}=req.params
    if(!videoId||!playlistId){
        throw new ApiError(400,"videoId and playlistId is required")
    }

    const userId=req.user?._id
    const removeVideo=await Playlist.findOneAndUpdate(
        {
            owner:userId,
            _id:playlistId,
        },

        // $pull operator, which directly removes an element from an array in the database, without loading the whole playlist document into memory.
        {
            $pull:{
                videos:videoId
            }
        },
        {
            new:true
        }
    )


    if(!removeVideo){
        throw new ApiError(400,"Error while removing video from playlist")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,removeVideo,"remove video from playlist successfully"))
})


const deletePlayList=asyncHandler(async(req,res)=>{
    //deletePlayList
    const{playlistId}=req.params

    if(!playlistId){
        throw new ApiError(400,"playlistId is required")
    }

    const userId=req.user?._id
    const removePlaylist= await Playlist.findOneAndDelete(
        {
            owner:userId,
            _id:playlistId
        }
    )

    if(!removePlaylist){
        throw new ApiError(404,"Error while deleting playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,removePlaylist,"Playlist successfully delete"))
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    // updatePlaylist
    const {playlistId}=req.params
    const {name, description}=req.body

    if(!playlistId){
        throw new ApiError(400,"PlaylisId is required")
    }

    const userId=req.user?._id

    const newPlaylist=await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner:userId
        },
        {
            $set:{
                name,
                description
            }
        },
        {
            new:true
        }
    )

    if(!newPlaylist){
        throw new ApiError(404,"Error while updating Playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,newPlaylist,"playlist update successfully"))
})




export{
    createPlayList,
    addVideoToPlayList,
    getPlayListByID,
    removeVideoFromPlaylist,
    deletePlayList,
    updatePlaylist,
    getUserPlayLists
}
