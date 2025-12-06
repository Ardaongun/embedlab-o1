import { HTTP_STATUS } from "../config/statusCode.config.js";

class ApiError extends Error {
    constructor(status, message, error = null) {
        super(message);
        this.status = status;
        this.message = message;
        this.error = error;
        this.name = 'ApiError';
    }

    static badRequest(message = 'Bad request', error = null) {
        return new ApiError(HTTP_STATUS.BAD_REQUEST, message, error);
    }

    static unauthorized(message = 'Unauthorized', error = null) {
        return new ApiError(HTTP_STATUS.UNAUTHORIZED, message, error);
    }

    static forbidden(message = 'Forbidden', error = null) {
        return new ApiError(HTTP_STATUS.FORBIDDEN, message, error);
    }

    static notFound(message = 'Resource not found', error = null) {
        return new ApiError(HTTP_STATUS.NOT_FOUND, message, error);
    }

    static conflict(message = 'Conflict', error = null) {
        return new ApiError(HTTP_STATUS.CONFLICT, message, error);
    }

    static tooManyRequests(message = 'Too many requests', error = null) {
        return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message, error);
    }

    static internalServerError(message = 'Internal server error', error = null) {
        return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, error);
    }
}

export default ApiError;