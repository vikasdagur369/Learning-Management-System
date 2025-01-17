import Razorpay from "razorpay";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.TEST_KEY_ID,
  key_secret: process.env.TEST_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    const amount = course.coursePrice * 100; // Amount in paise

    // Create a Razorpay order
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `rcpt_${courseId}_${Date.now()}`.slice(0, 40),
    };
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res
        .status(500)
        .json({ success: false, message: "Error creating Razorpay order" });
    }

    // Save the purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
      paymentId: order.id,
    });
    await newPurchase.save();

    // Return Razorpay order details
    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.TEST_KEY_ID, // Public Razorpay Key ID
      name: course.courseTitle,
      description: "Purchase this course to unlock content",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid webhook signature");
    }

    if (body.event === "payment.captured") {
      const { order_id } = body.payload.payment.entity;

      const purchase = await CoursePurchase.findOne({
        paymentId: order_id,
      }).populate("courseId");

      if (!purchase)
        return res.status(404).json({ message: "Purchase not found" });

      purchase.status = "completed";

      // Make all lectures visible
      if (purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolled courses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );

      // Update course with the user as an enrolled student
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Fetch course details
    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    // Check if the user has purchased the course
    const purchased = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed", // Ensure the status is 'completed'
    });

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id;

    // Fetch all completed purchases for the user
    const purchasedCourses = await CoursePurchase.find({
      userId,
      status: "completed", // Only fetch completed purchases
    }).populate("courseId");

    if (!purchasedCourses || purchasedCourses.length === 0) {
      return res.status(404).json({
        message: "No purchased courses found!",
        purchasedCourses: [],
      });
    }

    return res.status(200).json({
      purchasedCourses,
    });
  } catch (error) {
    console.error("Error fetching purchased courses:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
