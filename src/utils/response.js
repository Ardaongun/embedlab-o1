import { HTTP_STATUS } from "../config/statusCode.config.js";

class Response {
    constructor(status, message, data = null, error = null) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    static success(data, message = 'Success', status = HTTP_STATUS.OK) {
        return new Response(status, message, data);
    }

    static created(data, message = 'Created', status = HTTP_STATUS.CREATED) {
        return new Response(status, message, data);
    }

    static noContent(message = 'No content') {
        return new Response(HTTP_STATUS.NO_CONTENT, message);
    }

    static error(message = 'An error occurred', status = HTTP_STATUS.INTERNAL_SERVER_ERROR, error = null) {
        return new Response(status, message, null, error);
    }

    static badRequest(message = 'Bad request', error = null) {
        return new Response(HTTP_STATUS.BAD_REQUEST, message, null, error);
    }

    static notFound(message = 'Resource not found', error = null) {
        return new Response(HTTP_STATUS.NOT_FOUND, message, null, error);
    }

    static unauthorized(message = 'Unauthorized', error = null) {
        return new Response(HTTP_STATUS.UNAUTHORIZED, message, null, error);
    }

    static forbidden(message = 'Forbidden', error = null) {
        return new Response(HTTP_STATUS.FORBIDDEN, message, null, error);
    }

    static tooManyRequests(message = 'Too many requests', error = null) {
        return new Response(HTTP_STATUS.TOO_MANY_REQUESTS, message, null, error);
    }

    static conflict(message = 'Conflict', error = null) {
        return new Response(HTTP_STATUS.CONFLICT, message, null, error);
    }

    send(res) {
        return res.status(this.status).json(this);
    }
}

export default Response;