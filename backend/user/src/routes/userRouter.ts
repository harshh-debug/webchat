import express from 'express';
import { loginUser, verifyUser } from '../controllers/user.js';
const userRouter=express.Router()

userRouter.post('/login',loginUser)
userRouter.post('/verify',verifyUser)

export default userRouter 