import mongoose, { Schema, type Model } from "mongoose";

export interface IChat extends Document{
    users:string[],
    latestMessage:{
        text:string,
        sender:string
    }
    createdAt:Date
    updatedAt:Date
}

const chatSchema:Schema<IChat>= new Schema({
    users:[{type:String,required:true}],
    latestMessage:{
        text:String,
        sender:String
    }

},{
    timestamps:true
})

export const chatModel=mongoose.model<IChat>("Chat",chatSchema)