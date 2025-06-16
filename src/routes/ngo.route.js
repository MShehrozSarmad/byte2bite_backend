import { Router } from "express";
import { isVerified, verifyJWT } from "../middlewares/auth.middleware.js";
import { isNGO } from "../middlewares/role.middleware.js";
import {
    activeContributions,
    availableFoodItems,
    makeRequest,
    updateStatusNGO,
} from "../controllers/ngo.controller.js";

const router = Router();

// router
//     .route("/reservation_req")
//     .post(verifyJWT, isVerified, isNGO, makeRequest);
// router
//     .route("/update_status")
//     .patch(verifyJWT, isVerified, isNGO, updateStatusNGO);

router.get("/getFoodItems", verifyJWT, isNGO, availableFoodItems);
router.get("/contributions", verifyJWT, isNGO, activeContributions);
router.post("/reservation_req", verifyJWT, isVerified, isNGO, makeRequest);
router.patch("/update_status", verifyJWT, isVerified, isNGO, updateStatusNGO);

export default router;
