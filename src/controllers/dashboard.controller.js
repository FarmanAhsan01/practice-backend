import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { isValidObjectId } from "mongoose"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId}=req.params
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel ID")
    }

    //get all video by this channel
    const videoIds=await Video.find(
        {
            owner:channelId
        }
    ).select("_id")
        // This line extracts all the _id fields from an array of video documents (videoIds) and stores them in a new array called videoIdList.
     const videoIdList = videoIds.map(video => video._id);

    const [videoStats,subscriptionStats,likeStats]=await Promise.all([
        Video.aggregate([
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(channelId )
                }
            },
            {
                $group:{
                    _id:null,
                    totalViews:{
                        $sum:"$views"
                    },
                    totalVideos:{
                        $sum:1
                    }
                }
            }
        ]),

        Subscription.aggregate([
            {
                $match:{
                    channel:new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count:"totalSubscribe"
            }
        ]),

        Like.aggregate([
            {
                $match:{
                    // $in is a MongoDB query operator that checks if a field’s value matches any value in a specified array.
                    //It's like saying
                    video:{$in:videoIdList}
                }
            },
            {
                $count:"totalLike"
            }
        ])
    ])
     const stats = {
       totalViews:videoStats[0]?.totalViews||0,
       totalVideos:videoStats[0]?.totalVideos||0,
       totalSubscribe:subscriptionStats[0]?.totalSubscribe||0,
       totalLike:likeStats[0]?.totalLike||0
    }

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel statistics fetched successfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId}=req.params
    const{page=1,limit=10}=req.query
    page=parseInt(page)
    limit=parseInt(limit)
    
    if(!channelId){
        throw new ApiError(400,"channelId is required")
    }

    if(mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"Invalid channelId format")
    }
    

    const skip=(page-1)*limit
    const [videos, totalCount] = await Promise.all([
    Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("title description thumbnail views createdAt"),

     Video.countDocuments({ owner: channelId })
    ]);

    return res 
    .status(200)
    .json(new ApiResponse(200,{videos,page,limit, totalPages: Math.ceil(totalCount / limit),
      totalVideos: totalCount},
    "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }