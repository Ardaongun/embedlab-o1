import { CONFIGS } from "../config/config.js";
import { ROLES } from "../config/role.config.js";
import {
  generateAccessToken
} from "../helpers/token.helper.js";
import ApiError from "../utils/apiError.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const adminLogin = withErrorHandling(async (username, password) => {
  if (
    username !== CONFIGS.SUPER_ADMIN.username ||
    password !== CONFIGS.SUPER_ADMIN.password
  ) {
    throw ApiError.badRequest("Username or password is incorrect.");
  }
  const payload = { username, role: ROLES.SUPER_ADMIN };
  const accessToken = generateAccessToken(payload, "1h");
  return { accessToken };
});