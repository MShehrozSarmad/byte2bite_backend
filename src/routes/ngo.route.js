import { Router } from "express";
import { isVerified, verifyJWT } from "../middlewares/auth.middleware.js";
import { isNGO } from "../middlewares/role.middleware.js";
import { makeRequest, updateStatusNGO } from "../controllers/ngo.controller.js";

const router = Router();

router
    .route("/reservation_req")
    .post(verifyJWT, isVerified, isNGO, makeRequest);
router
    .route("/update_status")
    .patch(verifyJWT, isVerified, isNGO, updateStatusNGO);

export default router;
