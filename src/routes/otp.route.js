import { Router } from "express";
import { getOTP, verifyOTP } from "../controllers/otp.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

//secure routes
router.route("/getOTP").post(verifyJWT, getOTP);
router.route("/verifyOTP").post(verifyJWT, verifyOTP);

export default router;
