import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { ddbDocClient as client } from "./connectDB.js";

const tables = [
    // 1. User
    {
        TableName: "User",
        AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
    },

    // 2. Session
    {
        TableName: "Session",
        AttributeDefinitions: [{ AttributeName: "sessionId", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "sessionId", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
    },

    // 3. Message
    {
        TableName: "Message",
        AttributeDefinitions: [
            { AttributeName: "sessionId", AttributeType: "S" },
            { AttributeName: "timestamp", AttributeType: "N" },
        ],
        KeySchema: [
            { AttributeName: "sessionId", KeyType: "HASH" },
            { AttributeName: "timestamp", KeyType: "RANGE" },
        ],
        BillingMode: "PAY_PER_REQUEST",
    },

    // 4. Video
    {
        TableName: "Video",
        AttributeDefinitions: [{ AttributeName: "videoId", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "videoId", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
    },

    // 5. Payment
    {
        TableName: "Payment",
        AttributeDefinitions: [{ AttributeName: "transactionId", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "transactionId", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
    },

    // 6. Matching
    {
        TableName: "Matching",
        AttributeDefinitions: [{ AttributeName: "subject", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "subject", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
    },

    // 7. SessionRequest
    {
        TableName: "SessionRequest",
        AttributeDefinitions: [{ AttributeName: "requestId", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "requestId", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
    },
];

(async () => {
    for (const table of tables) {
        try {
            await client.send(new CreateTableCommand(table));
            console.log(`✅ Created table: ${table.TableName}`);
        } catch (error) {
            if (error.name === "ResourceInUseException") {
                console.log(`ℹ️ Table ${table.TableName} already exists`);
            } else {
                console.error(`❌ Error creating ${table.TableName}:`, error);
            }
        }
    }
})();
