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
import { getLogger } from "../utils/context.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const refresh = withErrorHandling(async (refreshToken) => {
  const logger = getLogger();
  logger.info("Token refresh process initiated.");
  const [lookupKey, secretKey] = refreshToken.split(".");
  if (!lookupKey || !secretKey) {
    logger.warn(
      "Refresh failed: Invalid token format (Missing lookup or secret key)."
    );
    throw ApiError.unauthorized("Invalid token format.");
  }

  const user = await getOneUserDB({ lookupKey });
  if (!user) {
    logger.warn(
      { lookupKey },
      "Refresh failed: Lookup key not found (Potential token reuse or invalid token)."
    );
    throw ApiError.unauthorized("Invalid refresh token.");
  }

  const isValid = await bcrypt.compare(secretKey, user.refreshToken);
  if (!isValid) {
    logger.warn(
      { userId: user._id },
      "Refresh failed: Secret key signature mismatch."
    );
    throw ApiError.unauthorized("Invalid refresh token.");
  }

  if (user.refreshTokenExpiry < new Date()) {
    logger.warn(
      { userId: user._id, expiryDate: user.refreshTokenExpiry },
      "Refresh failed: Token has expired."
    );
    throw ApiError.unauthorized("Refresh token has expired.");
  }

  const payload = {
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
  const accessToken = generateAccessToken(payload, "15m");
  const {
    refreshToken: newRefreshToken,
    lookupKey: newLookupKey,
    hashedSecret,
  } = await generateRefreshToken();
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await updateUserByIdDB(user._id, {
    lookupKey: newLookupKey,
    refreshToken: hashedSecret,
    refreshTokenExpiry,
  });

  logger.info({ userId: user._id }, "Token refresh successful. Token rotated.");

  return { accessToken, refreshToken: newRefreshToken };
});

export const login = withErrorHandling(async (email, password) => {
  const logger = getLogger();
  logger.info({ email }, "User login attempt initiated.");
  const user = await getOneUserDB({ email });
  if (!user) {
    logger.warn({ email }, "Login failed: User account not found.");
    throw ApiError.badRequest("Email or password is incorrect.");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn(
      { userId: user._id, email },
      "Login failed: Invalid password provided."
    );
    throw ApiError.badRequest("Email or password is incorrect.");
  }

  const payload = {
    email: user.email,
    userId: user._id,
    role: user.role,
    organizationId: user.organizationId,
  };
  const accessToken = generateAccessToken(payload, "15m");
  const { refreshToken, lookupKey, hashedSecret } =
    await generateRefreshToken();
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await updateUserByIdDB(user._id, {
    lookupKey,
    refreshToken: hashedSecret,
    refreshTokenExpiry,
  });

  logger.info(
    {
      userId: user._id,
      role: user.role,
      organizationId: user.organizationId,
    },
    "User logged in successfully. Tokens generated."
  );

  return { accessToken, refreshToken };
});

export const adminLogin = withErrorHandling(async (username, password) => {
  const logger = getLogger();
  logger.info({ username }, "Super Admin login attempt initiated.");
  if (
    username !== CONFIGS.SUPER_ADMIN.username ||
    password !== CONFIGS.SUPER_ADMIN.password
  ) {
    logger.warn({ username }, "Super Admin login failed: Invalid credentials.");
    throw ApiError.badRequest("Username or password is incorrect.");
  }
  const payload = { username, role: ROLES.SUPER_ADMIN };
  const accessToken = generateAccessToken(payload, "1h");
  logger.info(
    { username, role: ROLES.SUPER_ADMIN },
    "Super Admin logged in successfully."
  );
  return { accessToken };
});

export const registerOrganization = withErrorHandling(
  async (email, password, organizationId) => {
    const logger = getLogger();
    logger.info(
      { email, organizationId },
      "Organization user registration initiated."
    );
    const existingUser = await getOneUserDB({ email }, { _id: 1 });
    if (existingUser) {
      logger.warn(
        { email },
        "Registration failed: Email is already registered."
      );
      throw ApiError.badRequest("Email is already registered.");
    }

    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      logger.warn(
        { organizationId, email },
        "Registration failed: Organization ID does not exist."
      );
      throw ApiError.badRequest("Organization does not exist.");
    }

    const newUserId = uuidv4();

    const newUser = {
      _id: newUserId,
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
    logger.info(
      { userId: newUserId, organizationId, email },
      "Organization user registered successfully."
    );
  }
);

export const register = withErrorHandling(
  async (email, password, organizationId) => {
    const logger = getLogger();
    logger.info(
      { email, organizationId },
      "Standard user registration initiated."
    );
    const existingUser = await getOneUserDB({ email }, { _id: 1 });
    if (existingUser) {
      logger.warn(
        { email },
        "Registration failed: Email is already registered."
      );
      throw ApiError.badRequest("Email is already registered.");
    }

    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      logger.warn(
        { organizationId },
        "Registration failed: Organization ID does not exist."
      );
      throw ApiError.badRequest("Organization does not exist.");
    }

    const newUser = {
      _id: uuidv4(),
      email,
      password: await bcrypt.hash(password, 10),
      role: ROLES.USER,
      organizationId,
      lookupKey: null,
      refreshToken: null,
      refreshTokenExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createUserDB(newUser);

    logger.info(
      { userId: newUserId, organizationId, email },
      "Standard user registered successfully."
    );
  }
);
