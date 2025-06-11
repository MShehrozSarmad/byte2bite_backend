import { Router } from "express";
import {
    addFood,
    // cont_stts_response,
    getFoodItem,
    getFoodItems,
    overview,
    updateStatusCont,
} from "../controllers/contributor.controller.js";
import { isVerified, verifyJWT } from "../middlewares/auth.middleware.js";
import { isContributor, isNGO } from "../middlewares/role.middleware.js";
const router = Router();

// role based secure routes
router.route("/overview").get(verifyJWT, isContributor, overview);
router.route("/addfood").post(verifyJWT, isVerified, isContributor, addFood);
router.route("/getfooditem").post(verifyJWT, isVerified, getFoodItem);
router.route("/getfooditems").post(verifyJWT, isVerified, getFoodItems);
// router.route("/update_reservation_request").patch(verifyJWT, isVerified, isContributor, cont_stts_response)
router
    .route("/update_status")
    .patch(verifyJWT, isVerified, isContributor, updateStatusCont);

export default router;
