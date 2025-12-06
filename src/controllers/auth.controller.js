import { CONFIGS } from "../config/config.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const pingHandler = withErrorHandling(async (req, res) => {
  return Response.success(null, "pong").send(res);
})