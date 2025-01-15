import { Router } from "express";
import {
    completeProfile,
    setProfilePicture,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use((req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

// router.route("/register").post( upload.single({name: "profilePicture"}) , registerUser);

//secure routes
router.route("/complete-profile").post(verifyJWT, completeProfile);
router
    .route("/upload/profilePicture")
    .post(verifyJWT, upload.single("profilePicture"), setProfilePicture);

export default router;