import {
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "../database/connectDB.js";

const PAYMENT_TABLE = process.env.PAYMENT_TABLE;

export const createPayment = async (payment) => {
    const params = {
        TableName: PAYMENT_TABLE,
        Item: {
            transactionId: payment.transactionId,
            userId: payment.userId,
            amount: payment.amount,
            currency: payment.currency || "INR",
            status: payment.status || "created",
            premiumPlan: payment.premiumPlan || "Learner Starter",
            paymentMethod: payment.paymentMethod || "razorpay",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        ConditionExpression: "attribute_not_exists(transactionId)",
    };

    await ddbDocClient.send(new PutCommand(params));
    return { ...params.Item };
};

export const getPayment = async (transactionId) => {
    const params = {
        TableName: PAYMENT_TABLE,
        Key: { transactionId },
    };
    const result = await ddbDocClient.send(new GetCommand(params));
    return result.Item || null;
};

export const updatePayment = async (transactionId, updates) => {
    let updateExp = "SET";
    const expAttrVals = {};
    const expAttrNames = {};
    let prefix = " ";

    for (const key in updates) {
        if (updates[key] !== undefined && key !== "updatedAt") {
            expAttrNames[`#${key}`] = key;
            expAttrVals[`:${key}`] = updates[key];
            updateExp += `${prefix}#${key} = :${key}`;
            prefix = ", ";
        }
    }

    // Always update updatedAt once
    expAttrNames["#updatedAt"] = "updatedAt";
    expAttrVals[":updatedAt"] = new Date().toISOString();
    updateExp += `${prefix}#updatedAt = :updatedAt`;

    const params = {
        TableName: PAYMENT_TABLE,
        Key: { transactionId },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: expAttrNames,
        ExpressionAttributeValues: expAttrVals,
        ReturnValues: "ALL_NEW",
    };

    const result = await ddbDocClient.send(new UpdateCommand(params));
    return result.Attributes;
};


export const deletePayment = async (transactionId) => {
    const params = {
        TableName: PAYMENT_TABLE,
        Key: { transactionId },
    };
    await ddbDocClient.send(new DeleteCommand(params));
    return { message: "Payment deleted successfully" };
};

export const listPayments = async (limit = 20, lastKey = null) => {
    const params = {
        TableName: PAYMENT_TABLE,
        Limit: limit,
        ExclusiveStartKey: lastKey || undefined,
    };
    const result = await ddbDocClient.send(new ScanCommand(params));
    return {
        payments: result.Items || [],
        lastKey: result.LastEvaluatedKey || null,
    };
};
