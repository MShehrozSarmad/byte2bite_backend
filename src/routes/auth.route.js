import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    resetPassword,
    reqResetPassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-tokens").post(refreshAccessToken);
router.route("/req-reset-password").post(reqResetPassword);
router.route("/reset-password/:token").post(resetPassword);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
