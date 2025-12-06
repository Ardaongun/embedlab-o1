import express from "express";
import * as tagController from "../controllers/tag.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";

const router = express.Router();

router.get(
  "/get-tags",
  authorizeMiddleware(ROLES.ORGANIZATION, ROLES.USER),
  tagController.getTagsByOrganizationHandler
);

router.post(
  "/create-tag",
  authorizeMiddleware(ROLES.ORGANIZATION),
  tagController.createTagHandler
);

router.put(
  "/update-tag/:tagId",
  authorizeMiddleware(ROLES.ORGANIZATION),
  tagController.updateTagHandler
);

router.delete(
  "/delete-tag/:tagId",
  authorizeMiddleware(ROLES.ORGANIZATION),
  tagController.deleteTagHandler
);

export default router;
