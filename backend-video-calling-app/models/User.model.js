import {
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
    QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";

const USER_TABLE = process.env.USER_TABLE;


export const createUser = async (user) => {
    const params = {
        TableName: USER_TABLE,
        Item: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role || "learner", // "learner" or "educator"
            topics: user.topics || [], // for learner
            skills: user.skills || [], // for educator
            bio: user.bio || "",
            password: user.password,
            refreshToken: user.refreshToken || null,
            availability: user.availability || "offline", // "online", "offline", "busy"
            currentSessionId: user.currentSessionId || null,
            socketId: user.socketId || null,
            avatarUrl: user.avatarUrl || null,
            rating: user.rating || 0,
            totalSessions: user.totalSessions || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastOnline: new Date().toISOString()
        },
        ConditionExpression: "attribute_not_exists(userId)"
    };

    await ddbDocClient.send(new PutCommand(params));
    return { ...params.Item };
};

/**
 * Get a user by ID
 */
export const getUser = async (userId) => {
    const params = {
        TableName: USER_TABLE,
        Key: { userId }
    };
    const result = await ddbDocClient.send(new GetCommand(params));
    return result.Item || null;
};

/**
 * Update a user
 */
export const updateUser = async (userId, updates) => {
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
        TableName: USER_TABLE,
        Key: { userId },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: expAttrNames,
        ExpressionAttributeValues: expAttrVals,
        ReturnValues: "ALL_NEW"
    };

    const result = await ddbDocClient.send(new UpdateCommand(params));
    return result.Attributes;
};

/**
 * Delete a user
 */
export const deleteUser = async (userId) => {
    const params = {
        TableName: USER_TABLE,
        Key: { userId },
        ConditionExpression: "attribute_exists(userId)"
    };
    await ddbDocClient.send(new DeleteCommand(params));
    return { message: "User deleted successfully" };
};


export const listUsers = async (limit = 20, lastKey = null) => {
    const params = {
        TableName: USER_TABLE,
        Limit: limit,
        ExclusiveStartKey: lastKey || undefined
    };
    const result = await ddbDocClient.send(new ScanCommand(params));
    return {
        users: result.Items || [],
        lastKey: result.LastEvaluatedKey || null
    };
};

/**
 * Check if user exists by ID
 */
export const userExists = async (userId) => {
    const user = await getUser(userId);
    return !!user;
};

/**
 * Check if user exists by email
 */
export const userExistsByEmail = async (email) => {
    // Email search is case-sensitive by default in DynamoDB
    const params = {
        TableName: USER_TABLE,
        FilterExpression: "#email = :email",
        ExpressionAttributeNames: { "#email": "email" },
        ExpressionAttributeValues: { ":email": email }
    };
    const result = await ddbDocClient.send(new ScanCommand(params));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
};



export const clearRefreshToken = async (userId) => {
    try {
        const params = {
            TableName: USER_TABLE,
            Key: { userId },
            UpdateExpression: "SET refreshToken = :nullValue",
            ExpressionAttributeValues: {
                ":nullValue": null
            },
            ConditionExpression: "attribute_exists(userId)",
        };

        await ddbDocClient.send(new UpdateCommand(params));

        return { success: true };
    } catch (error) {
        console.error("Error clearing refresh token:", error);
        throw new Error("Unable to clear refresh token");
    }
};



export const updateUserAvatarInDB = async (userId, avatarUrl) => {
    await ddbDocClient.send(new UpdateCommand({
        TableName: USER_TABLE,
        Key: { id: userId },
        UpdateExpression: "SET avatarUrl = :a",
        ExpressionAttributeValues: {
            ":a": avatarUrl
        }
    }));
};


export const updateUserById = async (userId, updateData) => {
    try {

        const updateKeys = Object.keys(updateData);
        if (updateKeys.length === 0) {
            throw new Error("No fields to update");
        }

        const updateExpression = `SET ${updateKeys.map((key, i) => `#${key} = :val${i}`).join(", ")}`;
        const expressionAttributeNames = updateKeys.reduce((acc, key) => {
            acc[`#${key}`] = key;
            return acc;
        }, {});

        const expressionAttributeValues = updateKeys.reduce((acc, key, i) => {
            acc[`:val${i}`] = updateData[key];
            return acc;
        }, {});

        const params = {
            TableName: process.env.USER_TABLE,
            Key: { userId },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW",
        };

        const result = await ddbDocClient.send(new UpdateCommand(params));
        return result.Attributes;

    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};




export async function updateUserAvailability(userId, socketId, status) {
    try {
        if (!status) throw new Error("updateUserAvailability: 'status' is required");
        if (!userId) throw new Error("updateUserAvailability: 'userId' is required");

        const expressionParts = [];
        const expAttrNames = {};
        const expAttrVals = {};

       
        expressionParts.push("#availability = :status");
        expAttrNames["#availability"] = "availability";
        expAttrVals[":status"] = status;

       
        if (socketId !== undefined) {
            expressionParts.push("#socketId = :socketId");
            expAttrNames["#socketId"] = "socketId";
            expAttrVals[":socketId"] = socketId;
        }

        
        expressionParts.push("#updatedAt = :updatedAt");
        expAttrNames["#updatedAt"] = "updatedAt";
        expAttrVals[":updatedAt"] = new Date().toISOString();

        const params = new UpdateCommand({
            TableName: USER_TABLE,
            Key: { userId },
            UpdateExpression: `SET ${expressionParts.join(", ")}`,
            ExpressionAttributeNames: expAttrNames,
            ExpressionAttributeValues: expAttrVals,
            ReturnValues: "ALL_NEW"
        });

        const result = await ddbDocClient.send(params);
        return result.Attributes;

    } catch (err) {
        console.error("❌ Error updating user availability:", err);
        throw err;
    }
}


