import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new ApiError(401, "unauthorized");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) throw new ApiError(401, "Invalid Access Token");

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(500, "Something went wrong while logging out");
    }
});

export { verifyJWT };