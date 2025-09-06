import { razorpay } from "../utils/payment.gateway.js";
import * as PaymentModel from "../models/Payment.model.js";
import * as UserModel from "../models/User.model.js";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";




export const createOrder = async (req, res) => {
    try {
        const { amount, premiumPlan } = req.body;
        const userId = req.user.id;

        if (!amount || !premiumPlan) {
            return res.status(400).json({ message: "Amount and plan are required" });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: "Something went wrong in order creation" });
        }

        await PaymentModel.createPayment({
            transactionId: order.id,
            userId,
            premiumPlan: premiumPlan,
            amount,
            currency: "INR",
            status: "pending",
            createdAt: new Date().toISOString(),
        });

        await UserModel.updateUser(userId, {
            premiumPlan,
            isPremium: false,
            premiumExpiresAt: null,
        });

        res.status(200).json({ order });
    } catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid signature sent!" });
        }

        await PaymentModel.updatePayment(razorpay_order_id, {
            status: "success",
            paymentId: razorpay_payment_id,
            updatedAt: new Date().toISOString()
        });

        const payment = await PaymentModel.getPayment(razorpay_order_id);
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        const expiresAt = new Date();
        if (payment.premiumPlan === "Educator Pro") {

            expiresAt.setDate(expiresAt.getDate() + 30);
        } else if (payment.premiumPlan === "Institution Elite") {

            expiresAt.setDate(expiresAt.getDate() + 90);
        } else {
            expiresAt.setDate(expiresAt.getDate() + 15);
        }


        await UserModel.updateUser(payment.userId, {
            isPremium: true,
            premiumExpiresAt: expiresAt.toISOString(),
            premiumPlan: payment.premiumPlan
        });


        res.status(200).json({ success: true, message: "Payment verified and premium activated" });


    } catch (error) {
        console.error("❌ Error verifying payment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
