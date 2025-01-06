class ApiError extends Error {
    constructor(
        statusCode,
        message,
        error = [],
        stack = "",
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message || "Something went wrong at server!!";
        this.success = false;
        this.error = this.error;

        if (stack) {
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }

        console.log(this.stack)
        this.stack = null;

    }
}

export {ApiError}