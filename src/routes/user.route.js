import { Router } from "express";
import {
    completeProfile,
    deleteAccount,
    getProfile,
    setProfilePicture,
    uploadCertificate,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use((req, _, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    next();
});

// router.route("/register").post( upload.single({name: "profilePicture"}) , registerUser);

//secure routes
//secure routes
router.route("/profile").put(verifyJWT, completeProfile);
router.route("/profile").get(verifyJWT, getProfile);
router.route("/del-account").delete(verifyJWT, deleteAccount);

// file upload routes
router
    .route("/upload/profile-picture")
    .post(verifyJWT, upload.single("profilePicture"), setProfilePicture);
router
    .route("/upload/certificate")
    .post(verifyJWT, upload.single("certificate"), uploadCertificate);
export default router;
