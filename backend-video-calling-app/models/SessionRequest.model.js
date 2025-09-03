import { PutCommand, QueryCommand, UpdateCommand, GetCommand,ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";
import { v4 as uuidv4 } from "uuid";

const SESSION_TABLE = process.env.SESSION_REQUEST;


export const saveMessage = async ({
    requestId,
    transcript,
    gist,
    speaker,
    roomId,
    userId,
    sessionId
}) => {
    const now = new Date().toISOString();

    const item = {
        requestId,                
        userId,                    
        roomId,                  
        sessionId,
        transcript,
        gist: gist || null,
        speaker: speaker || "unknown",
        timestamp: now,            
        itemType: "MESSAGE",
        status: "Active"
    };

    await ddbDocClient.send(new PutCommand({
        TableName: SESSION_TABLE,
        Item: item
    }));

    return item;
};


export const getMessagesByRequest = async (requestId, limit = 50) => {
    const params = {
        TableName: SESSION_TABLE,
        KeyConditionExpression: "requestId = :rid",
        ExpressionAttributeValues: {
            ":rid": requestId
        },
        Limit: limit
    };

    const result = await ddbDocClient.send(new QueryCommand(params));
    return (result.Items || []).filter(i => i.itemType === "MESSAGE");
};


export const getLatestGist = async (requestId) => {
    const params = {
        TableName: SESSION_TABLE,
        KeyConditionExpression: "requestId = :rid",
        ExpressionAttributeValues: {
            ":rid": requestId
        },
        ScanIndexForward: false,
        Limit: 1
    };

    const result = await ddbDocClient.send(new QueryCommand(params));
    const msg = (result.Items || []).find(i => i.itemType === "MESSAGE" && i.gist);
    return msg?.gist || null;
};


export const putSession = async (session) => {
    const now = new Date().toISOString();
    const requestId = session.requestId || uuidv4(); 

    const item = {
        requestId,                  
        roomId: session.roomId,
        userId: session.userId,
        status: session.status || "Active",
        createdAt: session.createdAt || now,
        updatedAt: now,
        itemType: "SESSION",
        timestamp: now             
    };

    await ddbDocClient.send(new PutCommand({ TableName: SESSION_TABLE, Item: item }));
    return item;
};


export async function updateSession(requestId, updates) {
    const params = {
        TableName: SESSION_TABLE,
        Key: { requestId },
        UpdateExpression: "set #status = :status, #endedAt = :endedAt",
        ExpressionAttributeNames: {
            "#status": "status",
            "#endedAt": "endedAt"
        },
        ExpressionAttributeValues: {
            ":status": updates.status,
            ":endedAt": updates.endedAt
        },
        ReturnValues: "ALL_NEW"
    };

    return await ddbDocClient.send(new UpdateCommand(params));
}


export const endSession = async (requestId) => {
    return updateSession(requestId, {
        status: "Ended",
        endedAt: new Date().toISOString()
    });
};


export const getSession = async (requestId) => {
    const params = {
        TableName: SESSION_TABLE,
        Key: { requestId }
    };

    const result = await ddbDocClient.send(new GetCommand(params));
    return result.Item?.itemType === "SESSION" ? result.Item : null;
};


export const getSessionsByUser = async (userId, limit = 50) => {
    if (!userId) return [];

    const params = {
        TableName: SESSION_TABLE,
        IndexName: "userId-timestamp-index", // GSI on userId
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        ScanIndexForward: false,
        Limit: limit
    };

    const result = await ddbDocClient.send(new QueryCommand(params));

    // Return all items where status exists (SESSION or MESSAGE)
    // You can still filter on itemType later if needed
    return result.Items || [];
};


export const getActiveSessionsByRoom = async (roomId) => {
    const params = {
        TableName: SESSION_TABLE,
        IndexName: "roomId-timestamp-index",
        KeyConditionExpression: "roomId = :rid",
        ExpressionAttributeValues: { ":rid": roomId },
        ScanIndexForward: false
    };

    const result = await ddbDocClient.send(new QueryCommand(params));
    return (result.Items || []).filter(i => i.status === "Active" && i.itemType === "SESSION");
};
