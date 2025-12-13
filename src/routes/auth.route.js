import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  adminLoginSchema,
  loginSchema,
  refreshTokenSchema,
  registerOrganizationSchema,
  registerSchema,
} from "../schemas/auth.schema.js";

const router = express.Router();

router.get("/ping", authController.pingHandler);
router.post(
  "/admin-login",
  validateRequest(adminLoginSchema),
  authController.adminLoginHandler
);
router.post(
  "/register-organization",
  authorizeMiddleware(ROLES.SUPER_ADMIN),
  validateRequest(registerOrganizationSchema),
  authController.registerOrganizationHandler
);
router.post(
  "/login",
  validateRequest(loginSchema),
  authController.loginHandler
);
router.post(
  "/refresh",
  validateRequest(refreshTokenSchema),
  authController.refreshHandler
);
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.registerHandler
);

export default router;
