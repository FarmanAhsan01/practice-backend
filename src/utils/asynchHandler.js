//using promises

const asyncHandler=(asyncHandler)=>{
    (req,res,next)=>{
        promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}



//using try catch ...........................

// const asyncHandler=(func)=>async(req,res,next)=>{
//     try{

//     }
//     catch(error){
//         res.status(error.code||500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }
