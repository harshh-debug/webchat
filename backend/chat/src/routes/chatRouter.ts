import express  from 'express';
import { isAuth } from '../middlewares/authMiddleware.js';
import { createNewChat, getAllChat, getMessagesByChat, sendMessage } from '../controllers/chatControllers.js';
import upload from '../middlewares/multer.js';
const chatRouter= express.Router()
chatRouter.post("/chat/new",isAuth,createNewChat)
chatRouter.get("/chat/all",isAuth,getAllChat)
chatRouter.post("/message",isAuth,upload.single('image'),sendMessage)
chatRouter.get("/messages/:chatId",isAuth,getMessagesByChat)
export default chatRouter
