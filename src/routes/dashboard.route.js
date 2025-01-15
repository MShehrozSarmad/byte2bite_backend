import { Router } from "express";
import { overview } from "../controllers/dashboard.controller.js";
import { checkRole, isVerified, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// role based secure routes
router.route("/overview").get(verifyJWT, isVerified, checkRole, overview);

export default router;