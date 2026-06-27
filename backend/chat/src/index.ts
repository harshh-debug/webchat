import dotenv  from 'dotenv';
dotenv.config()
import cors  from 'cors';
import express from "express"
import connectDb from './config/db.js';
import chatRouter from './routes/chatRouter.js';
import { app,server } from './config/socket.js';
connectDb()
app.use(express.json())
app.use("/api/v1", cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}), chatRouter)

const port = process.env.PORT
server.listen(port,()=>{
    console.log(`Chat service is running at ${port}`)
})