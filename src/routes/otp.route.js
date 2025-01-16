import { Router } from "express";
import { getOTP, verifyOTP } from "../controllers/otp.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

//secure routes
router.route("/otp").get(verifyJWT, getOTP);
router.route("/otp").post(verifyJWT, verifyOTP);

export default router;
