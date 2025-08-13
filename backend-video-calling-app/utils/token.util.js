import jwt from "jsonwebtoken";
import * as UserModel from "../models/User.model.js";

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "35m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

const generateTokens = (user) => {
    const payload = {
        id: user.userId,
        role: user.role || "learner",
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
};


const storeRefreshToken = async (userId, refreshToken) => {
    await UserModel.updateUser(userId, { refreshToken });
};


const setAuthCookies = (res, accessToken, refreshToken) => {
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        maxAge: 1000 * 60 * 35,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
};


const generateAndStoreTokensAndSetCookies = async (res, user) => {
    const { accessToken, refreshToken } = generateTokens(user);
    await storeRefreshToken(user.userId, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);
    return { accessToken, refreshToken };
};

export {
    generateTokens,
    storeRefreshToken,
    setAuthCookies,
    generateAndStoreTokensAndSetCookies,
};
