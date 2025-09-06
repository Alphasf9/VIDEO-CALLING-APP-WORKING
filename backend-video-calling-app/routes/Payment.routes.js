import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createOrder, verifyPayment } from "../controllers/Payment.controller.js";



const router = express.Router();


router.post("/create-order", authenticate, createOrder)

router.post("/verify-payment", authenticate, verifyPayment)

export default router;