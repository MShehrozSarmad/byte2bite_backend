import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, _, res, _) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: null
        });
    }

    // Handle other types of errors
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        data: null
    });
};

export { errorHandler }; 