import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";

const MESSAGE_TABLE = process.env.MESSAGE_TABLE;


export const saveMessage = async ({ sessionId, transcript, gist, speaker }) => {
    const item = {
        sessionId,
        timestamp: new Date().toISOString(),
        transcript,
        gist: gist || null,
        speaker: speaker || "unknown"
    };

    await ddbDocClient.send(new PutCommand({ TableName: MESSAGE_TABLE, Item: item }));
    return item;
};


export const getMessagesBySession = async (sessionId, limit = 50) => {
    const params = {
        TableName: MESSAGE_TABLE,
        KeyConditionExpression: "sessionId = :sid",
        ExpressionAttributeValues: { ":sid": sessionId },
        ScanIndexForward: false,
        Limit: limit
    };

    const result = await ddbDocClient.send(new QueryCommand(params));
    return result.Items || [];
};


export const getLatestGist = async (sessionId) => {
    const messages = await getMessagesBySession(sessionId, 1);
    return messages.length ? messages[0].gist : null;
};


export async function queryBySession(sessionId, limit = 1) {
    const result = await ddbDocClient.send(
        new QueryCommand({
            TableName: MESSAGE_TABLE,
            KeyConditionExpression: "sessionId = :sessionId",
            ExpressionAttributeValues: {
                ":sessionId": sessionId,
            },
            ScanIndexForward: false,
            Limit: limit,
        })
    );

    return result.Items || [];
}


export const put = async (item) => {
    const params = {
        TableName: MESSAGE_TABLE,
        Item: item,
    };

    await ddbDocClient.send(new PutCommand(params));
    return item;
};
