import { asyncHandler } from "../utils/asynchHandler"
//getAllVideo
const getAllVideo=asyncHandler(async(req,res)=>{
    const{}=req.query
})
//publishAvideo
const publishAvideo=asyncHandler(async(req,res)=>{
    const{title,description}=req.body
})

//getVideoById
const{videoId}=req.params
//updateVideo

//deleteVideo

//togglePublishStatus