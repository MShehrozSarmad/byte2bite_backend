import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { HOME } from "./constants.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

//logging
const accessLogStream = fs.createWriteStream(
    path.join(process.cwd(), "access.log"),
    { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

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
import ngoRoutes from "./routes/ngo.route.js";

app.get("/", (req, res) => {
    res.status(200).send(HOME);
});

// using routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/verify", otpRouter);
app.use("/api/v1/contributor/dashboard", cntrbtrRouter);
app.use("/api/v1/ngo", ngoRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

export { app };
