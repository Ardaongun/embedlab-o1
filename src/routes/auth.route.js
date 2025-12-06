import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";

const router = express.Router();

router.get("/ping", authController.pingHandler);
router.post("/admin-login", authController.adminLoginHandler);
router.post(
  "/register-organization",
  authorizeMiddleware(ROLES.SUPER_ADMIN),
  authController.registerOrganizationHandler
);
router.post("/login", authController.loginHandler);
router.post("/refresh", authController.refreshHandler);
router.post("/register", authController.registerHandler);

export default router;
