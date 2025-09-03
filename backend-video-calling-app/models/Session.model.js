import {
    PutCommand,
    GetCommand,
    UpdateCommand,
    ScanCommand,
    QueryCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";

const SESSION_TABLE = process.env.SESSION_TABLE;

export const createSession = async (session) => {
    if (!session.sessionId || typeof session.sessionId !== 'string' || session.sessionId.trim() === '') {
        throw new Error("sessionId is required and must be a non-empty string");
    }

    const sessionData = {
        sessionId: session.sessionId.trim(), // here this is userId
        roomId: session.roomId || null,
        participants: session.participants || [],
        status: session.status || "active",
        sessionType: session.sessionType || "video",
        startedAt: session.startedAt || new Date().toISOString(),
        endedAt: session.endedAt || null, 
        metadata: session.metadata || {},
        updatedAt: new Date().toISOString(),
    };

    console.log("Processed session data for DB:", JSON.stringify(sessionData, null, 2));

    const params = {
        TableName: SESSION_TABLE,
        Item: sessionData,
    };

    await ddbDocClient.send(new PutCommand(params));
    return sessionData;
};





export const getSession = async (sessionId) => {
    const params = {
        TableName: SESSION_TABLE,
        Key: { sessionId },
    };

    const result = await ddbDocClient.send(new GetCommand(params));
    return result.Item || null;
};


export const updateSession = async (sessionId, updates) => {
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No updates provided");
    }

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
        TableName: SESSION_TABLE,
        Key: { sessionId },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: expAttrNames,
        ExpressionAttributeValues: expAttrVals,
        ReturnValues: "ALL_NEW",
    };

    const result = await ddbDocClient.send(new UpdateCommand(params));
    return result.Attributes;
};


export const listSessions = async (limit = 20, lastKey = null) => {
    const params = {
        TableName: SESSION_TABLE,
        Limit: limit,
        ExclusiveStartKey: lastKey || undefined,
    };

    const result = await ddbDocClient.send(new ScanCommand(params));
    return {
        sessions: result.Items || [],
        lastKey: result.LastEvaluatedKey || null,
    };
};


export const deleteSession = async (sessionId) => {
    const params = {
        TableName: SESSION_TABLE,
        Key: { sessionId },
        ConditionExpression: "attribute_exists(sessionId)", // ensures exists
    };

    await ddbDocClient.send(new DeleteCommand(params));
    return { message: `Session ${sessionId} deleted successfully` };
};


export const endSession = async (sessionId) => {
    return updateSession(sessionId, {
        status: "ended",
        endedAt: new Date().toISOString(),
    });
};
