import jwt from 'jsonwebtoken';
import * as UserModel from "../models/User.model.js";
import { generateTokens, setAuthCookies, storeRefreshToken } from './token.util.js';


const JWT_SECRET = process.env.JWT_SECRET;


export const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        let payload;
        try {
            payload = jwt.verify(refreshToken, JWT_SECRET);
        } catch (error) {
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        const user = await UserModel.getUser(payload.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(404).json({ message: "Refresh token not found or mismatched" });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
        await storeRefreshToken(newRefreshToken);
        setAuthCookies(res, accessToken, newRefreshToken);
        return res.json({
            accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while refreshing access token" });

    }
}