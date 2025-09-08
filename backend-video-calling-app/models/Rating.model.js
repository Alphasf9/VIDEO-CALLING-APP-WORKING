import {
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
    QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";
import * as UserModel from './User.model.js';

const RATING_TABLE = process.env.RATING_TABLE;

export const createRating = async (rating) => {
    const params = {
        TableName: RATING_TABLE,
        Item: {
            sessionId: rating.sessionId,      // PK
            fromUserId: rating.fromUserId,    // SK
            toUserId: rating.toUserId,        // GSI PK
            rating: rating.rating,            // GSI SK
            comment: rating.comment || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        ConditionExpression: "attribute_not_exists(sessionId) AND attribute_not_exists(fromUserId)"
    };

    await ddbDocClient.send(new PutCommand(params));
    return { ...params.Item };
};

export const getRating = async (sessionId, fromUserId) => {
    const params = {
        TableName: RATING_TABLE,
        Key: { sessionId, fromUserId }
    };
    const result = await ddbDocClient.send(new GetCommand(params));
    return result.Item || null;
};

const getUserAvgRating = (ratings = []) => {
    if (!ratings.length) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
};

export const updateRating = async (sessionId, fromUserId, updates) => {
    let updateExp = "SET";
    const expAttrVals = {};
    const expAttrNames = {};
    let prefix = " ";

    for (const key in updates) {
        if (updates[key] !== undefined) {
            expAttrNames[`#${key}`] = key;
            expAttrVals[`:${key}`] = updates[key];
            updateExp += `${prefix}#${key} = :${key}`;
            prefix = ", ";
        }
    }

    expAttrNames["#updatedAt"] = "updatedAt";
    expAttrVals[":updatedAt"] = new Date().toISOString();
    updateExp += `${prefix}#updatedAt = :updatedAt`;

    const params = {
        TableName: RATING_TABLE,
        Key: { sessionId, fromUserId },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: expAttrNames,
        ExpressionAttributeValues: expAttrVals,
        ReturnValues: "ALL_NEW"
    };

    const result = await ddbDocClient.send(new UpdateCommand(params));
    return result.Attributes;
};

export const deleteRating = async (sessionId, fromUserId) => {
    const params = {
        TableName: RATING_TABLE,
        Key: { sessionId, fromUserId },
        ConditionExpression: "attribute_exists(sessionId) AND attribute_exists(fromUserId)"
    };
    await ddbDocClient.send(new DeleteCommand(params));
    return { message: "Rating deleted successfully" };
};

export const getRatingsForUser = async (toUserId) => {
    const params = {
        TableName: RATING_TABLE,
        IndexName: "toUserId-rating-index",
        KeyConditionExpression: "#toUserId = :toUserId",
        ExpressionAttributeNames: { "#toUserId": "toUserId" },
        ExpressionAttributeValues: { ":toUserId": toUserId }
    };

    const result = await ddbDocClient.send(new QueryCommand(params));
    return result.Items || [];
};

export const calculateAverageRating = async (toUserId) => {
    const ratings = await getRatingsForUser(toUserId);
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
};



export const getTopRatedEducators = async (limit = 5) => {
    const allEducators = await UserModel.getAllEducators();

    const ratingResult = await ddbDocClient.send(new ScanCommand({ TableName: RATING_TABLE }));
    const allRatings = ratingResult.Items || [];
    const ratingMap = {};
    allRatings.forEach(r => {
        if (!ratingMap[r.toUserId]) ratingMap[r.toUserId] = [];
        ratingMap[r.toUserId].push(Number(r.rating));
    });

    const educatorsWithRating = allEducators.map(u => ({
        userId: u.userId,
        name: u.name,
        avatarUrl: u.avatarUrl,
        skills: u.skills || [],
        avgRating: getUserAvgRating(ratingMap[u.userId])
    }));

    educatorsWithRating.sort((a, b) => b.avgRating - a.avgRating);

    return educatorsWithRating.slice(0, limit);
};


export const getTopRatedLearners = async (limit = 5) => {
    const allLearners = await UserModel.getAllLearners();

    const ratingResult = await ddbDocClient.send(new ScanCommand({ TableName: RATING_TABLE }));
    const allRatings = ratingResult.Items || [];

    const ratingMap = {};
    allRatings.forEach(r => {
        if (!ratingMap[r.toUserId]) ratingMap[r.toUserId] = [];
        ratingMap[r.toUserId].push(Number(r.rating));
    });

    const learnersWithRating = allLearners.map(u => ({
        userId: u.userId,
        name: u.name,
        avatarUrl: u.avatarUrl,
        topics: u.topics || [],
        avgRating: getUserAvgRating(ratingMap[u.userId])
    }));

    learnersWithRating.sort((a, b) => b.avgRating - a.avgRating);

    return learnersWithRating.slice(0, limit);
};