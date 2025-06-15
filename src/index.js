// require('dotenv').config({path:'./env'})
import mongoose from "mongoose";
import { DB_NAME } from "./db/constants.js";
import express from"express";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
dotenv.config({
     path: "./.env"
 });
connectDB()

.then(()=>{
    app.on("error",(error)=>{
        console.log("error",error)
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port${process.env.PORT} `)
    })
})
.catch((error)=>{
    console.log("Mongo db connexted fail!!",error)
})

// const app=express()
// (async()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error)=>{
//         console.log("Error:",error);
//        })
//        app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port${process.env.PORT}`)
//        })
//     }
//     catch(error){
//         console.error("Error: ",error)
//         throw error
//     }
// })()