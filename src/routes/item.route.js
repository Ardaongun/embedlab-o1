import express from "express";
import * as itemController from "../controllers/item.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";

const router = express.Router();

router.post(
  "/add-item",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  itemController.addItemHandler
);

export default router;
