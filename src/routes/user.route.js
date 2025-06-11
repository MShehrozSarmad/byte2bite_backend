import { Router } from "express";
import {
    completeProfile,
    deleteAccount,
    getNotifications,
    getProfile,
    setProfilePicture,
    uploadCertificate,
} from "../controllers/user.controller.js";
import { isVerified, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isNGO } from "../middlewares/role.middleware.js";

const router = Router();

router.use((req, _, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

//secure routes
router.route("/profile").put(verifyJWT, completeProfile);
router.route("/profile").get(verifyJWT, getProfile);
router.route("/del-account").delete(verifyJWT, deleteAccount);
router.route("/notifications").get(verifyJWT, getNotifications);

// file upload routes
router
    .route("/upload/profile-picture")
    .post(verifyJWT, upload.single("profilePicture"), setProfilePicture);
router
    .route("/upload/certificate")
    .post(verifyJWT, isNGO, upload.single("certificate"), uploadCertificate);
export default router;
