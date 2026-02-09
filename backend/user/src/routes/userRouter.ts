import express from 'express';
import { loginUser } from '../controllers/user.js';
const userRouter=express.Router()

userRouter.post('/login',loginUser)

export default userRouter 