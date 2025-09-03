import { Inngest } from "inngest";
import dotenv from "dotenv";
dotenv.config();


export const inngest = new Inngest({
    id: "learning-hub",   
    eventKey: process.env.INNGEST_EVENT_KEY,
    eventApiUrl: process.env.INNGEST_EVENT_API_URL,
});




