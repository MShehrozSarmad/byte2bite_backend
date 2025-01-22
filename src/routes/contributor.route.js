import { Router } from "express";
import { addFood, getFoodItem, getFoodItems, overview } from "../controllers/contributor.controller.js";
import { isVerified, verifyJWT } from "../middlewares/auth.middleware.js";
import { isContributor, isNGO } from "../middlewares/role.middleware.js";
const router = Router();

// role based secure routes
router.route("/overview").get(verifyJWT, isVerified, isContributor, overview);
router.route("/addfood").post(verifyJWT, isVerified, isContributor, addFood);
router.route("/getfooditem").post(verifyJWT, isVerified, isContributor, getFoodItem);
router.route("/getfooditems").post(verifyJWT, isVerified, isContributor, getFoodItems);

export default router;
