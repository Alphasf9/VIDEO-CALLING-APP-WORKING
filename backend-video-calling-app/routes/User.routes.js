import express from "express";
import {
    getUserProfile, loginUser, logoutUser
    , signUpUser, updatePassword,
    updateUserProfileInfo
} from "../controllers/User.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { generateAvatarUploadUrl, updateAvatar } from "../controllers/Avatar.controller.js";
import { refreshAccessToken } from "../utils/refreshToken.util.js";




const router = express.Router();



router.post("/user-signup", signUpUser)

router.post('/user-login', loginUser)

router.post('/user-logout', authenticate, logoutUser)

router.get('/user-profile', authenticate, getUserProfile)

router.post('/user-url', authenticate, generateAvatarUploadUrl)

router.put('/update-password', authenticate, updatePassword)

router.put('/update-user-avatar', authenticate, updateAvatar)

router.post('/refresh-token', refreshAccessToken);

router.patch('/update-user-deatils', authenticate, updateUserProfileInfo)

export default router;