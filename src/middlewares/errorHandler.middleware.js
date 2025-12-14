import ApiError from "../utils/apiError.js";
import Response from "../utils/response.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  // 1. Operational Errors (Known errors: Validations, Not Found, etc.)
  if (err instanceof ApiError) {
    req.log.warn(
      {
        errorType: "ApiError",
        statusCode: err.status,
        errorMessage: err.message,
      },
      "Operational error occurred."
    );
    return Response.error(err.message, err.status, err.error).send(res);
  }

  // 2. Programming or System Errors (Unexpected 500s)
  req.log.error({ err }, "An unexpected system error occurred.");

  return Response.error("Something went wrong, please try again later.").send(res);
};
