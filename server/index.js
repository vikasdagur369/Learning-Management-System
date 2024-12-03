import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({});

const app = express();
const PORT = process.env.PORT || 8080;

// default middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

//call database connection

connectDB();

//apis
app.use("/api/v1/user", userRoute);

app.get("/home", (_, res) => {
  res.status(200).json({
    success: true,
    message: "hello I am coming from backend",
  });
});

app.listen(PORT, () => {
  console.log(`app is listening on port no ${PORT}`);
});
