import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isContributor = asyncHandler(async (req, _, next) => {
    console.log("contributor check :::");
    // console.log(req.user.role);
    if (req.user.role !== "contributor")
        throw new ApiError(
            403,
            `you dont have permissions to access these resources, user role is, ${req.user.role}`
        );
    next();
});

const isNGO = asyncHandler(async (req, _, next) => {
    // console.log(req.user);
    if (req.user.role !== "ngo")
        throw new ApiError(
            403,
            `you dont have permissions to access these resources, user role is, ${req.user.role}`
        );
    next();
});

// const checkRole = asyncHandler(async (req, _, next) => {
//     console.log("role checked");
//     console.log(req.user.role);
//     if (req.user.role == "pending")
//         throw new ApiError(403, "your role is pending");
//     next();
// });

export { isContributor, isNGO };
