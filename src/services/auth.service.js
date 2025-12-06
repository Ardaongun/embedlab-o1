import { CONFIGS } from "../config/config.js";
import { ROLES } from "../config/role.config.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../helpers/token.helper.js";
import { getOrganizationByIdDB } from "../repositories/organizations.repository.js";
import {
  createUserDB,
  getOneUserDB,
  updateUserByIdDB,
} from "../repositories/users.repository.js";
import ApiError from "../utils/apiError.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const login = withErrorHandling(async (email, password) => {
  const user = await getOneUserDB({ email });
  if (!user) {
    throw ApiError.badRequest("Email or password is incorrect.");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.badRequest("Email or password is incorrect.");
  }

  const payload = {
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
  const accessToken = generateAccessToken(payload, "15m");
  const {
    refreshToken,
    lookupKey,
    hashedSecret,
  } = await generateRefreshToken();
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await updateUserByIdDB(user._id, {
    lookupKey,
    refreshToken: hashedSecret,
    refreshTokenExpiry,
  })

  return { accessToken, refreshToken };
});

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

export const registerOrganization = withErrorHandling(
  async (email, password, organizationId) => {
    const existingUser = await getOneUserDB({ email }, { _id: 1 });
    if (existingUser) {
      throw ApiError.badRequest("Email is already registered.");
    }

    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      throw ApiError.badRequest("Organization does not exist.");
    }

    const newUser = {
      _id: uuidv4(),
      email,
      password: await bcrypt.hash(password, 10),
      role: ROLES.ORGANIZATION,
      organizationId,
      lookupKey: null,
      refreshToken: null,
      refreshTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createUserDB(newUser);
  }
);
