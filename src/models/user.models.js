import mongoose,{Schema} from "mongoose";
import bcrypt from"bcrypt";
import jwt from "jsonwebtoken";


const userSchema =new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowerCase:true,
            trim:true,
            index:true    //for searchable
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowerCase:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true
        },
        coverImage:{
            type:String,
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,"PASSWORD IS REQUIED"],

        },
        refreshToken:{
            type:String
        }
    },
{
    timestamps:true
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password,10)
    next()
})

userSchema.method.isPasswordCorrect= async function (password){
    return await bcrypt.compare(password,this.password)
}
userSchema.method.genrateAccessToken=function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userSchema.method.genrateRefrashToken=function(){
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User",userSchema)

//bcrypt for password encryption and decryption


//jwt for making tokens