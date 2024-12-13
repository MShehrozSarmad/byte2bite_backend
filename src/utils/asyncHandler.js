import { ApiError } from "./apiError";

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(new ApiError(500, "Somwthing went wrong at server", err))
        );
    };
};
export { asyncHandler };
