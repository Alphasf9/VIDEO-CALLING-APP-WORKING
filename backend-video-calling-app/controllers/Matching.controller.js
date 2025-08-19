import dotenv from "dotenv";
import { ddbDocClient } from "../database/connectDB.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

async function getEmbedding(text) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

function cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return normA && normB ? dot / (normA * normB) : 0;
}

export const matchLearnerToEducator = async (req, res) => {
    try {
        const { topics, topN = 3 } = req.body;

        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({ message: "Please provide topics" });
        }

        const params = { TableName: process.env.USER_TABLE };
        const result = await ddbDocClient.send(new ScanCommand(params));
        const allUsers = result.Items || [];

        const educators = allUsers.filter((u) => u.role === "educator");

        if (educators.length === 0) {
            return res.status(404).json({ message: "No educators found" });
        }

        const matches = [];
        const matchedEducatorIds = new Set();

        const educatorEmbeddings = {};
        for (const educator of educators) {
            const skillText =
                Array.isArray(educator.skills) && educator.skills.length
                    ? educator.skills.join(", ")
                    : "";
            educatorEmbeddings[educator.userId] = await getEmbedding(skillText);
        }

        for (const topic of topics) {
            const topicEmbedding = await getEmbedding(topic);

            const topicMatches = educators.map((educator) => {
                const similarity = cosineSimilarity(
                    topicEmbedding,
                    educatorEmbeddings[educator.userId]
                );

                return {
                    educatorId: educator.userId,
                    educatorName: educator.name,
                    educatorSkills: educator.skills,
                    bio: educator.bio,
                    similarityScore: similarity * 100, 
                    rawScore: similarity,
                };
            });

            topicMatches.sort((a, b) => b.similarityScore - a.similarityScore);

            const topMatches = topicMatches
                .filter((e) => !matchedEducatorIds.has(e.educatorId))
                .slice(0, topN);

            for (const match of topMatches) {
                matchedEducatorIds.add(match.educatorId);
                matches.push({
                    learnerTopic: topic,
                    ...match,
                });
            }
        }

        matches.sort((a, b) => b.similarityScore - a.similarityScore);

        return res.status(200).json({ matches });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};
