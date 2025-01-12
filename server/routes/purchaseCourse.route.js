import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createOrder,
  getAllPurchasedCourse,
  getCourseDetailWithPurchaseStatus,
  razorpayWebhook,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.route("/checkout/create-order").post(isAuthenticated, createOrder);
router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), razorpayWebhook);
router
  .route("/course/:courseId/detail-with-status")
  .get(isAuthenticated, getCourseDetailWithPurchaseStatus);

router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;
