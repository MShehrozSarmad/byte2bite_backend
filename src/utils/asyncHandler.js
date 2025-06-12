// import { ApiError } from "./apiError.js";

// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) =>
//             next(new ApiError(500, "Something went wrong at server", err))
//         );
//     };
// };
// export { asyncHandler };


import { ApiError } from "./apiError.js";

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            console.log(err);
            if (err instanceof ApiError) {
                return next(err);
            }
            next(new ApiError(500,  err.message || "Something went wrong at server!"));
        });
    };
};

export { asyncHandler };
