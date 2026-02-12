import dotenv  from 'dotenv';
import express from "express"
import connectDb from './config/db.js';
import chatRouter from './routes/chat.js';
dotenv.config()
connectDb()
const app= express()
app.use(express.json())
app.use("/api/v1",chatRouter)
const port = process.env.PORT
app.listen(port,()=>{
    console.log(`Chat service is running at ${port}`)
})