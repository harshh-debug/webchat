import express  from 'express';
import { isAuth } from '../middlewares/authMiddleware.js';
import { createNewChat, getAllChat, sendMessage } from '../controllers/chatControllers.js';
import upload from '../middlewares/multer.js';
const chatRouter= express.Router()
chatRouter.post("/chat/new",isAuth,createNewChat)
chatRouter.get("/chat/all",isAuth,getAllChat)
chatRouter.post("/message",isAuth,upload.single('image'),sendMessage)
export default chatRouter
