import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import * as UserModel from '../models/User.model.js';
import { comparePassword, hashPassword } from '../utils/password.util.js';
import { generateAndStoreTokensAndSetCookies } from '../utils/token.util.js';
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../database/connectDB.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";



export const signupSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address")
        .transform((val) => val.toLowerCase()),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["learner", "educator"]).optional()
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address").transform(val => val.toLowerCase()),
    password: z.string().min(8, "Password must be atleast 8 character long"),
})



export const signUpUser = async (req, res) => {
    try {
        const parsedData = signupSchema.parse(req.body);
        const userExists = await UserModel.userExistsByEmail(parsedData.email);
        if (userExists) {
            console.log(userExists);
            return res.status(400).json({ message: "User already exists" });
        }

        const userId = uuidv4();
        const hashedPassword = await hashPassword(parsedData.password);


        const user = await UserModel.createUser({
            userId,
            email: parsedData.email,
            name: parsedData.name,
            password: hashedPassword,
            role: parsedData.role || "learner",
            refreshToken: "",
            avatarUrl: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        await generateAndStoreTokensAndSetCookies(res, user);

        const { password, refreshToken, ...safeUser } = user;
        res.status(201).json({
            message: "User registered successfully",
            user: safeUser
        });

    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error while signing up." });
    }
};



export const loginUser = async (req, res) => {
    try {
        const parsedData = loginSchema.parse(req.body);

        const userExists = await UserModel.userExistsByEmail(parsedData.email);
        if (!userExists) {
            return res.status(400).json({ message: "User does not exist" });
        };

        const isPasswordValid = await comparePassword(parsedData.password, userExists.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const { accessToken } = await generateAndStoreTokensAndSetCookies(res, userExists);

        const { password, refreshToken, ...safeUser } = userExists;

        res.status(201).json({
            message: "User logged in successfully",
            user: safeUser,
            refreshToken,
            accessToken
        });

    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("login error:", error);
        res.status(500).json({ message: "Internal server error while logging in." });
    }
}



export const logoutUser = async (req, res) => {
    try {
        await UserModel.clearRefreshToken(req.user.id);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error while logging out." });
    }
}



export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.user;

        const params = {
            TableName: process.env.USER_TABLE,
            Key: { userId: id },
        };

        const result = await ddbDocClient.send(new GetCommand(params));

        if (!result.Item) {
            return res.status(404).json({ message: "User not found" });
        }

        delete result.Item.password;

        return res.status(200).json({
            message: "User profile fetched successfully",
            user: result.Item
        });

    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("Get user profile error:", error);
        res.status(500).json({ message: "Internal server error while getting user profile." });
    }
};




export const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Old and new passwords are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const params = {
            TableName: process.env.USER_TABLE,
            Key: { userId: req.user.id }
        };
        const { Item: user } = await ddbDocClient.send(new GetCommand(params));

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await comparePassword(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const hashedPassword = await hashPassword(newPassword);
        const updateParams = {
            TableName: process.env.USER_TABLE,
            Key: { userId: req.user.id },
            UpdateExpression: "SET #password = :password, updatedAt = :updatedAt",
            ExpressionAttributeNames: { "#password": "password" },
            ExpressionAttributeValues: {
                ":password": hashedPassword,
                ":updatedAt": new Date().toISOString()
            },
            ReturnValues: "UPDATED_NEW"
        };
        await ddbDocClient.send(new UpdateCommand(updateParams));

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({ message: "Internal server error while updating password." });
    }
};