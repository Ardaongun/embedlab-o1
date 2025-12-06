import express from "express";
import * as organizationController from "../controllers/organization.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";
const router = express.Router();

router.post(
  "/create-organization",
  authorizeMiddleware(ROLES.SUPER_ADMIN),
  organizationController.createOrganizationHandler
);

router.get(
  "/get-all-organizations",
  authorizeMiddleware(ROLES.SUPER_ADMIN),
  organizationController.getAllOrganizationsHandler
);

export default router;
