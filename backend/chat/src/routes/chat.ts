import express  from 'express';
import { isAuth } from '../middlewares/authMiddleware.js';
import { createNewChat, getAllChat } from '../controllers/chatControllers.js';
const chatRouter= express.Router()
chatRouter.post("/chat/new",isAuth,createNewChat)
chatRouter.get("/chat/all",isAuth,getAllChat)
export default chatRouter
