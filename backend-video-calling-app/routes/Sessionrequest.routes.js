import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import { createSessionPeruser, endSessionOfUser, getAllSessionsOfUser, getSessionPeruser } from "../controllers/Sessionrequest.controller.js";

const router = express.Router();


router.post("/create-session-per-user", authenticate, createSessionPeruser)


router.get("/:requestId", authenticate, getSessionPeruser)


router.get("/get-all-user-session/:userId", authenticate, getAllSessionsOfUser);


router.patch("/:sessionId/end", authenticate, endSessionOfUser); //TODO LOOK TO THIS ROUTE FUCNIONING OF SESSION ID




export default router;