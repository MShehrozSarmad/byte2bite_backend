import { Router } from "express";
import { getOTP, verifyOTP } from "../controllers/otp.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {otpLimit} from "../utils/rateLimiting.js"

const router = Router();

router.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

//secure routes
router.get("/otp", otpLimit ,verifyJWT, getOTP);
router.post("/otp", verifyJWT, verifyOTP);

export default router;
