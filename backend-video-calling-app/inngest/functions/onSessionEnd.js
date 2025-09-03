import { inngest } from "../../inngest/client.js";
import { generateGist } from "../../service/ai.service.js";
import { v4 as uuidv4 } from "uuid";
import * as SessionRequest from "../../models/SessionRequest.model.js";
import { endSessionOfUser } from "../../controllers/Sessionrequest.controller.js";
import * as SessionModel from "../../models/Session.model.js";

export const onSessionEnd = inngest.createFunction(
  {
    id: "generate-session-gist",
    name: "Generate Session Gist",
  },
  { event: "session/end" },

  async ({ event }) => {
    try {
      let { requestId, transcript, userId, speaker, roomId, sessionId } = event.data;
      console.log("📩 Incoming event data:", event.data);

      if (!transcript || !userId || !speaker || !roomId || !sessionId) {
        console.log("❌ Missing required fields in event data");
        return { error: "Missing required data" };
      }

      if (!requestId || requestId === userId) {
        requestId = uuidv4();
        console.log("🔄 Generated new requestId:", requestId);
      }

      const session = await SessionModel.endSession(sessionId);

      const gist = await generateGist(transcript);

      const messageItem = {
        requestId,          
        roomId,     
        timestamp: new Date().toISOString(),
        sessionId,
        gist,
        userId,             
        speaker,
        transcript,
        messageId: uuidv4(),
        originalTranscript: transcript,
      };


      await SessionRequest.saveMessage(messageItem);

      return { gist, session, saved: true, requestId };
    } catch (error) {
      console.error("Error processing session end event:", error);
      return { error: error.message };
    }
  }
);
