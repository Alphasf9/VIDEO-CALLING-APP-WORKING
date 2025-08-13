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

/**
 * Create a new user
 */
export const createUser = async (user) => {
    const params = {
        TableName: USER_TABLE,
        Item: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role || "learner",
            password: user.password,
            refreshToken: user.refreshToken || null,
            avatarUrl: user.avatarUrl || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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

    // Always update updatedAt timestamp
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

/**
 * List users (with optional pagination)
 */
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