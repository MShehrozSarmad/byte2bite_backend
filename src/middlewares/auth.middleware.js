import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

//checks for if user is valid or not by token
const verifyJWT = asyncHandler(async (req, _, next) => {
    const token =
        req.body?.accessToken ||
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    console.log(token);

    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");

    if (token) {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) throw new ApiError(401, "Invalid Access Token");

        req.user = user;
    } else {
        throw new ApiError(401, "unauthorized request");
        // or here we will redirect user to refresh tokens
    }

    req.incomingRefreshToken = incomingRefreshToken;
    next();
});

export { verifyJWT };
