import { Router } from "express";
import { isVerified, verifyJWT } from "../middlewares/auth.middleware";
import { isNGO } from "../middlewares/role.middleware";
import { makeRequest } from "../controllers/ngo.controller";

const router = Router();

router.route('/reservation_req').post(verifyJWT, isVerified, isNGO, makeRequest)

export default router;