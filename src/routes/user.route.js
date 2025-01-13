import { Router } from "express";
import {
    completeProfile,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
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
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-tokens").post(refreshAccessToken);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/complete-profile").post(verifyJWT, completeProfile);
router.route("/upload/profilePicture").post(verifyJWT, upload.single("profilePicture"), setProfilePicture);

export default router;
