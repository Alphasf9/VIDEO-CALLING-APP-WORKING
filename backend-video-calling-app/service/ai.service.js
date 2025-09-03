import dotenv from 'dotenv';
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.5
});

export async function generateGist(newTranscript, previousGist = "") {
    if (!newTranscript) return "No transcript provided.";

    const prompt = previousGist
        ? `
You are an AI assistant. Update the existing gist with the following new transcript content. 
Ensure the updated gist is **comprehensive and detailed**, capturing all important points from the conversation, including:

- Key topics discussed
- Questions asked by the learner
- Answers, explanations, and clarifications from the educator
- Any decisions, instructions, or important conclusions
- The overall flow and context of the session

Previous Gist:
${previousGist}

New Transcript:
${newTranscript}

Provide an updated, coherent, and structured summary, using multiple sentences or short paragraphs as needed.
`
        : `
You are an AI assistant. Summarize the following transcript into a **comprehensive, detailed gist**. Ensure the summary:

- Covers all key topics discussed
- Highlights questions from the learner and answers from the educator
- Includes decisions, clarifications, and important points
- Reflects the full flow and context of the session
- Is structured, coherent, and easy to read
- Uses multiple sentences or short paragraphs as needed

Transcript:
${newTranscript}
`;

    try {
        const response = await llm.invoke([
            new HumanMessage({ content: prompt })
        ]);

        if (!response?.content) return "AI could not generate a gist.";
        return response.content.trim();
    } catch (err) {
        console.error("❌ AI Error:", err.message);
        return "Error generating gist from AI.";
    }
}
