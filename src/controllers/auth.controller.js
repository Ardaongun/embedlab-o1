import {
  adminLogin,
  login,
  refresh,
  register,
  registerOrganization,
} from "../services/auth.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const pingHandler = withErrorHandling(async (req, res) => {
  return Response.success(null, "pong").send(res);
});

export const adminLoginHandler = withErrorHandling(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return Response.badRequest("Username or password is missing").send(res);
  }
  const result = await adminLogin(username, password);
  return Response.success(result, "Login successful").send(res);
});

export const registerOrganizationHandler = withErrorHandling(
  async (req, res) => {
    const { email, password, organizationId } = req.body;
    if (!email || !password || !organizationId) {
      return Response.badRequest(
        "Email, password or organizationId is missing"
      ).send(res);
    }

    await registerOrganization(email, password, organizationId);
    return Response.noContent().send(res);
  }
);

export const loginHandler = withErrorHandling(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Response.badRequest("Email or password is missing").send(res);
  }
  const result = await login(email, password);
  return Response.success(result, "Login successful").send(res);
});

export const refreshHandler = withErrorHandling(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return Response.badRequest("Refresh token is missing").send(res);
  }
  const result = await refresh(refreshToken);
  return Response.success(result, "Token refreshed successfully").send(res);
});

export const registerHandler = withErrorHandling(async (req, res) => {
  const { email, password, organizationId } = req.body;

  if (!email || !password || !organizationId) {
    return Response.badRequest(
      "One or more required fields are missing: email, password, or organizationId"
    ).send(res);
  }

  await register(email, password, organizationId);
  return Response.noContent().send(res);
});
