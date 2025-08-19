import {
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
    QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";

const MATCHING_TABLE = process.env.MATCHING_TABLE;

export const createOrUpdateMatch = async (match) => {
    const params = {
        TableName: MATCHING_TABLE,
        Item: {
            subject: match.subject,
            educatorId: match.educatorId,
            name: match.name,
            bio: match.bio || "",
            skills: match.skills || [],
            rating: match.rating || 0,
            availability: match.availability || "offline",
            lastOnline: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    };

    await ddbDocClient.send(new PutCommand(params));
    return params.Item;
};

export const getEducatorsBySubject = async (subject) => {
    const params = {
        TableName: MATCHING_TABLE,
        KeyConditionExpression: "subject = :subj",
        ExpressionAttributeValues: {
            ":subj": subject
        }
    };

    const result = await ddbDocClient.send(new QueryCommand(params));
    return result.Items || [];
};

export const deleteMatch = async (subject, educatorId) => {
    const params = {
        TableName: MATCHING_TABLE,
        Key: {
            subject,
            educatorId
        }
    };
    await ddbDocClient.send(new DeleteCommand(params));
    return { message: "Match deleted successfully" };
};

export const listMatches = async (limit = 20, lastKey = null) => {
    const params = {
        TableName: MATCHING_TABLE,
        Limit: limit,
        ExclusiveStartKey: lastKey || undefined
    };
    const result = await ddbDocClient.send(new ScanCommand(params));
    return {
        matches: result.Items || [],
        lastKey: result.LastEvaluatedKey || null
    };
};
