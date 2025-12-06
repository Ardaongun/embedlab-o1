import express from "express";
import * as tagController from "../controllers/tag.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";

const router = express.Router();

router.post(
  "/create-tag",
  authorizeMiddleware(ROLES.ORGANIZATION),
  tagController.createTagHandler
);

export default router;
