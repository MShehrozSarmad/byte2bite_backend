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
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import otpRouter from "./routes/otp.route.js";
import cntrbtrRouter from "./routes/contributor.route.js";

// using routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/verify", otpRouter);
app.use("/api/v1/contributor/dashboard", cntrbtrRouter);
// app.use("/api/v1/ngo", )

export { app };
