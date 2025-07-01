import mongoose,{Schema} from "mongoose";
import { User } from "./user.models";

const subscriptionSchema=new schema({
    subscriber:{
        type: Schema.Types.ObjectId,  // one who is subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, // one to whom subscriber is subscribing
        ref:"User"
    }

},{Timestamp:true})

export const subcription=mongoose.model("subscription",subscriptionSchema)