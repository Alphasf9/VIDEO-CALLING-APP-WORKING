import express from "express";
import {
    getUserProfile, loginUser, logoutUser
    , signUpUser, updatePassword
} from "../controllers/User.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { generateAvatarUploadUrl } from "../controllers/Avatar.controller.js";




const router = express.Router();



router.post("/user-signup", signUpUser)

router.post('/user-login', loginUser)

router.post('/user-logout', authenticate, logoutUser)

router.get('/user-profile', authenticate, getUserProfile)

router.post('/user-url', authenticate, generateAvatarUploadUrl)

router.put('update-password', authenticate, updatePassword)



export default router;