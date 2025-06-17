import express from "express";
import cookieParser from "cookie-parser";

const app=express()

//use->for configation and in middleware
//cors just for setting
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true

}))

//when data comes json format
app.use(express.json({limit:"16kb"}))

//when data comes from url

app.use(express.urlencoded({extended:true,linit:"16kb"}))

//to store image file in public folder
app.use(express.static("public"))

app.use(cookieParser())






export { app }