import { CONFIGS } from "../config/config.js";
import { adminLogin } from "../services/auth.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const pingHandler = withErrorHandling(async (req, res) => {
  return Response.success(null, "pong").send(res);
})

export const adminLoginHandler = withErrorHandling(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return Response.badRequest("Username or password is missing").send(res);
  }
  const result = await adminLogin(username, password);
  return Response.success(result, "Login successful").send(res);
})