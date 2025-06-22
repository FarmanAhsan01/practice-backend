import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app=express()

//use->for configation and in middleware
//cors just for setting
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credential:true

}))

//when data comes json format
app.use(express.json({limit:"16kb"}))

//when data comes from url

app.use(express.urlencoded({extended:true,limit:"16kb"}))

//to store image file in public folder
app.use(express.static("public"))

app.use(cookieParser()) 

//import routes
import userRouter from "./routes/user.route.js";


//we use because when we seprate into part so we should be involve middleware by using use...we also use get when your code is not seperate
app.use("/api/v1/users",userRouter)



export { app }