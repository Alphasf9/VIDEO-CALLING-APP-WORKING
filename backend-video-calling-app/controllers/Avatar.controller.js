import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';
import * as UserModel from '../models/User.model.js';


const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});

const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;

export const generateAvatarUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({ message: "File name and type are required" });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({ message: "Invalid file type" });
        }

        const extension = fileName.split('.').pop();
        const key = `avatar/${req.user.id}/${uuidv4()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            ContentType: fileType
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
        const publicUrl = `${CLOUDFRONT_URL}/${key}`;


        await UserModel.updateUserById(req.user.id, { avatarUrl: publicUrl });

        return res.status(200).json({
            uploadUrl: signedUrl,
            publicUrl,
            key
        });

    } catch (error) {
        console.error("Error generating avatar upload URL:", error);
        return res.status(500).json({ message: "Error generating avatar upload URL" });
    }
};
