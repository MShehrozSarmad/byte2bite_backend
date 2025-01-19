import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isContributor = asyncHandler(async (req, _, next) => {
    console.log("loged in as a contributor");
    // console.log(req.user);
    if (req.user.role !== "contributor")
        throw new ApiError(
            403,
            "user dont have permissions to access these resources"
        );
    next();
});

const isNGO = asyncHandler(async (req, _, next) => {
    // console.log(req.user);
    if (req.user.role !== "ngo")
        throw new ApiError(
            403,
            "user dont have permissions to access these resources"
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
