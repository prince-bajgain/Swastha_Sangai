import express from "express"
import { checkAuth } from "../middlewares/auth.middleware.js";
import {  getAllUsers, getUserData, updateFitnessProfile } from "../controllers/user.controller.js";
import uploadFactory from "../middlewares/uploadFactory.js";

const userRouter = express.Router();
const uploadProfilePic = uploadFactory("profile-pics");

userRouter.get('/user-data',checkAuth,getUserData);
userRouter.put('/update-fitness-profile',checkAuth,uploadProfilePic.single('profileImage'),updateFitnessProfile);
userRouter.get('/getAllUsers',checkAuth,getAllUsers);

export default userRouter;