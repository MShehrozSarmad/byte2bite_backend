import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authLimit, resetPswrdLimit } from "../utils/rateLimiting.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    resetPassword,
    reqResetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

router.post("/register", authLimit, registerUser);
router.post("/login", loginUser);
router.post("/refresh-tokens", refreshAccessToken);
router.post("/req-reset-password", resetPswrdLimit, reqResetPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", verifyJWT, logoutUser);

export default router;
