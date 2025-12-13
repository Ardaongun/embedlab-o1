import ApiError from "../utils/apiError.js";
import Response from "../utils/response.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return Response.error(err.message, err.status, err.error).send(res);
  }

  console.log("Something went wrong:");
  console.error(err);
  // logger.error({context:`An unexpected error occurred: ${err.message}`});
  return Response.error("Something went wrong").send(res);
};
