import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// cors configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// importing routes
import userRouter from "./routes/user.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

// using routes
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app };