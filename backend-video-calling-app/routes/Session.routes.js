import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createSession, endSession, getSession } from "../controllers/Session.controller.js";
import { getSessionMessages } from "../controllers/Message.controller.js";
import { endSessionOfUser } from "../controllers/Sessionrequest.controller.js";

const router = express.Router()


router.post("/create-session", authenticate, createSession)

router.get("/:sessionId", authenticate, getSession)

router.patch("/:sessionId/end", authenticate, endSessionOfUser);
// router.patch("/:sessionId/end", authenticate, endSession);

router.get("/:sessionId/messages", authenticate, getSessionMessages);



export default router;