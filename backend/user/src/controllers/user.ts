import type { Request, Response } from "express";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitmq.js";

export const loginUser =async(req:Request,res:Response)=>{
    try {
        const {email}=req.body

    const rateLimitKey=`OTP:ratelimit:${email}`
    const rateLimit= await redisClient.get(rateLimitKey)
    if(rateLimit){
        res.status(429).json({
            message:"Too many requests. Please wait before trying again."
        })
        return
    }

    const OTP=Math.floor(100000 + Math.random() * 900000).toString()

    const OTPkey=`OTP:${email}`
    await redisClient.set(OTPkey,OTP,{
        EX:300
    })

    await redisClient.set(rateLimitKey,"true",{
        EX:60
    })

    const message={
        to:email,
        subject:"WebChat OTP code",
        body:`Your OTP is ${OTP}.It is valid for 5 minutes`
    }
    await publishToQueue("send-otp",message)
    res.status(200).json({
        message:"OTP send to your email"
    })
    } catch (error:any) {
        console.log("Error in loginUser",error)
        return res.status(500).json({
            message:error.message
        })
        
    }
    

}

