import express from "express";
import { getAllUsers, getAUser, loginOauthUser, loginUser, myProfile, updateName, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middleware/authMiddleware.js";
const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/oauth", loginOauthUser);
userRouter.post("/verify", verifyUser);
userRouter.get("/me", isAuth, myProfile);
userRouter.get("/user/all",isAuth,getAllUsers)
userRouter.get("/user/:id",getAUser)
userRouter.post("/update/user",isAuth,updateName)

export default userRouter;
