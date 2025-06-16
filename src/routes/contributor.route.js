import { Router } from "express";
import {
    activeContributions,
    addFood,
    // cont_stts_response,
    getFoodItem,
    getFoodItems,
    getReservationRequests,
    overview,
    updateStatusCont,
} from "../controllers/contributor.controller.js";
import { isVerified, verifyJWT } from "../middlewares/auth.middleware.js";
import { isContributor, isNGO } from "../middlewares/role.middleware.js";
const router = Router();

// role based secure routes
router.get("/overview", verifyJWT, isContributor, overview);
router.get("/getfooditem", verifyJWT, isContributor, getFoodItem);
router.get("/getfooditems", verifyJWT, isContributor, getFoodItems);
router.get("/reservations", verifyJWT, isContributor, getReservationRequests);
router.get("/contributions", verifyJWT, isContributor, activeContributions);
router.post("/addfood", verifyJWT, isVerified, isContributor, addFood);
router.patch(
    "/update_status",
    verifyJWT,
    isVerified,
    isContributor,
    updateStatusCont
);

export default router;
