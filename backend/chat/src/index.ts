import cors  from 'cors';
import dotenv  from 'dotenv';
import express from "express"
import connectDb from './config/db.js';
import chatRouter from './routes/chatRouter.js';
import { app,server } from './config/socket.js';
dotenv.config()
connectDb()
app.use(express.json())
app.use(cors())
app.use("/api/v1",chatRouter)
const port = process.env.PORT
server.listen(port,()=>{
    console.log(`Chat service is running at ${port}`)
})