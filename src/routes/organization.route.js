import express from "express";
import * as organizationController from "../controllers/organization.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";
import { createOrganizationSchema } from "../schemas/organization.schema.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
const router = express.Router();

router.post(
  "/create-organization",
  authorizeMiddleware(ROLES.SUPER_ADMIN),
  validateRequest(createOrganizationSchema),
  organizationController.createOrganizationHandler
);

router.get(
  "/get-all-organizations",
  authorizeMiddleware(ROLES.SUPER_ADMIN),
  organizationController.getAllOrganizationsHandler
);

export default router;
