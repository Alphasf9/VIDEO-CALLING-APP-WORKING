import dotenv from "dotenv";
import { ddbDocClient } from "../database/connectDB.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as MatchingModel from '../models/Match.model.js';

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
        const { learnerId, topics, topN = 3 } = req.body;

        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({ message: "Please provide topics" });
        }
        if (!learnerId) {
            return res.status(400).json({ message: "Please provide learnerId" });
        }

        const params = { TableName: process.env.USER_TABLE };
        const result = await ddbDocClient.send(new ScanCommand(params));
        const educators = (result.Items || []).filter(u => u.role === "educator");

        if (educators.length === 0) {
            return res.status(404).json({ message: "No educators found" });
        }

        const educatorEmbeddings = {};
        for (const edu of educators) {
            const skillText = (edu.skills && edu.skills.length) ? edu.skills.join(", ") : "";
            educatorEmbeddings[edu.userId] = await getEmbedding(skillText);
        }

        const matches = [];
        let bestMatch = null;

        for (const topic of topics) {
            const topicEmbedding = await getEmbedding(topic);

            // Calculate similarity for all educators
            const topicMatches = educators.map(edu => {
                const similarity = cosineSimilarity(topicEmbedding, educatorEmbeddings[edu.userId]);
                return {
                    learnerTopic: topic,
                    educatorId: edu.userId,
                    educatorName: edu.name,
                    educatorSkills: edu.skills || [],
                    bio: edu.bio || "",
                    similarityScore: similarity * 100,
                    rawScore: similarity
                };
            });

            // Sort descending by similarity
            topicMatches.sort((a, b) => b.similarityScore - a.similarityScore);

            // Add top N matches for display
            const topMatches = topicMatches.slice(0, topN);
            matches.push(...topMatches);

            // Check for best overall match
            if (!bestMatch || topMatches[0].rawScore > bestMatch.rawScore) {
                const top = topMatches[0];
                bestMatch = {
                    subject: topic,          // DynamoDB PK
                    learnerId,
                    educatorId: top.educatorId,
                    name: top.educatorName,
                    skills: top.educatorSkills,
                    bio: top.bio,
                    similarityScore: top.similarityScore,
                    rawScore: top.rawScore,
                    availability: "offline",
                    lastOnline: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            }
        }

        // Store only the best match
        if (bestMatch) {
            await MatchingModel.createOrUpdateMatch(bestMatch);
        }

        // Sort final display list by similarity
        matches.sort((a, b) => b.similarityScore - a.similarityScore);

        return res.status(200).json({ topMatches: matches.slice(0, topN), bestMatch });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};



export const matchEducatorToLearners = async (req, res) => {
    try {
        const { educatorId, skills, topN = 3 } = req.body;

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ message: "Please provide educator skills" });
        }
        if (!educatorId) {
            return res.status(400).json({ message: "Please provide educatorId" });
        }

        const params = { TableName: process.env.USER_TABLE };
        const result = await ddbDocClient.send(new ScanCommand(params));
        const learners = (result.Items || []).filter(u => u.role === "learner");

        if (learners.length === 0) {
            return res.status(404).json({ message: "No learners found" });
        }

        const skillText = skills.join(", ");
        const educatorEmbedding = await getEmbedding(skillText);

        // Store merged learner matches
        const learnerMatchesMap = {};
        let bestMatch = null;

        for (const learner of learners) {
            if (!learner.topics || learner.topics.length === 0) continue;

            const topicScores = [];

            for (const topic of learner.topics) {
                const topicEmbedding = await getEmbedding(topic);
                const similarity = cosineSimilarity(educatorEmbedding, topicEmbedding);
                const score = similarity * 100;

                topicScores.push({
                    learnerTopic: topic,
                    similarityScore: score,
                    rawScore: similarity
                });

                // Track best single match for DB
                if (!bestMatch || similarity > bestMatch.rawScore) {
                    bestMatch = {
                        subject: topic,
                        educatorId,
                        learnerId: learner.userId,
                        name: learner.name,
                        topics: learner.topics,
                        bio: learner.bio || "",
                        similarityScore: score,
                        rawScore: similarity,
                        availability: "offline",
                        lastOnline: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                }
            }

            // Sort topics per learner and keep top 3
            topicScores.sort((a, b) => b.similarityScore - a.similarityScore);
            learnerMatchesMap[learner.userId] = {
                educatorId,
                educatorSkills: skills,
                learnerId: learner.userId,
                learnerName: learner.name,
                learnerTopics: learner.topics,
                bio: learner.bio || "",
                topTopics: topicScores.slice(0, 3)
            };
        }

        // Convert map to array and sort by best topic score
        const topMatches = Object.values(learnerMatchesMap).sort(
            (a, b) => b.topTopics[0].similarityScore - a.topTopics[0].similarityScore
        );

        // Store the best overall match in DynamoDB
        if (bestMatch) {
            await MatchingModel.createOrUpdateMatch(bestMatch);
        }

        return res.status(200).json({
            topMatches,
            bestMatch
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};



