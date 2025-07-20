import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { populate } from "dotenv"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // req.query holds URL query parameters like: ?page=2&limit=5&sortBy=views
    page=parseInt(page);
    limit=parseInt(limit);
    // These come as strings from URL (e.g. "2", "5"), so we convert them to numbers.
    const filter={};

    if(query){
        filter.title={$regex:query,$option:"i"}
    }
    //regex-> MongoDB will match any video title that contains "html" anywhere in the string.
    //option:"i"->"i" means case-insensitive.
    if(userId){
        filter.owner=userId;
    }

    const sort={};
    sort[sortBy]=sortType==="asc" ? 1:-1

    // above code explanation

    // This uses bracket notation to create a dynamic key in the object.
    // 1 means ascending order.
    // -1 means descending order

    const videos=await Video.find(filter)
    .populate("owner","username fullName  avatar")
    .sort(sort)
    .skip((page-1)*limit)
    .limit(limit)
    // This tells Mongoose:

// "Replace the owner field (which is an ObjectId) with actual user details from the users collection."

// "owner": The field to populate (must be a reference in the schema).

// "username fullName avatar": Only bring these specific fields from the users collection. It avoids loading too much data.

// For example:

// page = 1, limit = 10 → skip 0

// page = 2, limit = 10 → skip 10 (starts from the 11th document)

// It helps show only some results on each page.

// if limit = 10, you’ll get 10 videos maximum per request.


    const total=await Video.countDocument(filter)

    return res
    .status(200)
    .json(new ApiResponse(200,{total,page,limit,videos},"Fetched videos successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath=req.file?.path
    if(!videoLocalPath){
        throw new ApiError(400,"Video file is required")
    }
    const video=await Video.uploadOnCloudinary(videoLocalPath)

    if(!video.url){
        throw new ApiError(400,"Error while uploading")
    }
    const newVideo=await Video.create({
        title,
        description,
        thumbnail,
        videoFiles:video.url,
        owner:req.user?._id
    })
    if(!newVideo){
        throw new ApiError(400,"Error while uploading video")
    }
    return res
  .status(200)
  .json(new ApiResponse(200,newVideo,"Video Upload successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400,"videoId is not avalaible")
    }
    const userId=req.user?._id
    const updatedVideo=await Video.findOneAndUpdate(
        {_id:videoId,owner:userId},
        {
            $set:{
                 title,
                description,
                thumbnail,
    
            }
        },
        {new:true}
    )
    if(!updatedVideo){
        throw new ApiError(400,"Error while uploading")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedVideo,"video upload successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }
    const userId=req.user?._id
    const deletedVideo=await Video.findOneAndDelete(
        {
            _id:videoId,
            owner:userId
        }
    )
    if(!deletedVideo){
        throw new ApiError(400,"Error while deleting video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,deletedVideo,"Video delete successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if videoId is provided
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    // (Optional but Recommended) Check if videoId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const userId = req.user?._id;

    // Find the video by ID and owner
    const video = await Video.findOne({
        _id: videoId,
        owner: userId
    });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Toggle the current publish status
    video.isPublished = !video.isPublished;

    // Save the updated video
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`)
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}