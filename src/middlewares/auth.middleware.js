import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

//checks for if user is valid or not by token
const verifyJWT = asyncHandler(async (req, _, next) => {
    console.log("running verify jwt");

    const token =
        req.body?.accessToken ||
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    console.log(token);
    if (!token) throw new ApiError(401, "unauthorized request");

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name == "TokenExpiredError") {
            throw new ApiError(401, "Access Token Expired");
        } else {
            console.log(err);
            throw new ApiError(401, "Something went wrong, please relogin");
        }
    }
    console.log(decodedToken);

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(400, "Invalid or tampered access token");

    req.user = user;
    next();
});

const checkRole = asyncHandler(async (req, res, next) => {
    console.log("role checked");
    console.log(req.user.role);
    if (req.user.role == "pending") {
        return res.send("your role is pending");
    } else {
        next();
    }
});

export { verifyJWT, checkRole };
