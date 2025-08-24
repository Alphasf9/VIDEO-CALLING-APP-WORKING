import {
    PutCommand,
    QueryCommand,
    DeleteCommand,
    ScanCommand
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";
import { v4 as uuidv4 } from "uuid";

const MATCHING_TABLE = process.env.MATCHING_TABLE;

export const createOrUpdateMatch = async (match) => {
    const now = new Date().toISOString();
    const matchId = uuidv4();

    const params = {
        TableName: MATCHING_TABLE,
        Item: {
            subject: match.subject,       // <-- must match your table's PK
            matchId,                      // optional sort key
            learnerId: match.learnerId,
            educatorId: match.educatorId,
            educatorName: match.name,
            educatorSkills: match.skills || [],
            bio: match.bio || "",
            similarityScore: match.similarityScore || 0,
            rawScore: match.rawScore || 0,
            sessionStatus: match.sessionStatus || "pending",
            createdAt: now,
            updatedAt: now,
        },
    };

    await ddbDocClient.send(new PutCommand(params));
    return params.Item;
};


export const getMatchesForLearner = async (learnerId) => {
    const params = {
        TableName: MATCHING_TABLE,
        KeyConditionExpression: "learnerId = :lid",
        ExpressionAttributeValues: { ":lid": learnerId },
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    return result.Items || [];
};

export const deleteMatch = async (learnerId, matchId) => {
    const params = {
        TableName: MATCHING_TABLE,
        Key: { learnerId, matchId },
    };
    await ddbDocClient.send(new DeleteCommand(params));
    return { message: "Match deleted successfully" };
};

export const listMatches = async (limit = 20, lastKey = null) => {
    const params = {
        TableName: MATCHING_TABLE,
        Limit: limit,
        ExclusiveStartKey: lastKey || undefined,
    };
    const result = await ddbDocClient.send(new ScanCommand(params));
    return {
        matches: result.Items || [],
        lastKey: result.LastEvaluatedKey || null,
    };
};
