import express from "express";
import * as itemController from "../controllers/item.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";
import { fileUploadMiddleware } from "../middlewares/fileUpload.middleware.js";

const router = express.Router();

router.get(
  "/get-items",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  itemController.getItemsHandler
);

router.post(
  "/add-item",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  itemController.addItemHandler
);

router.post(
  "/add-item-photo",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  fileUploadMiddleware,
  itemController.addItemPhotoHandler
);

router.delete(
  "/delete-item-photo/:photoId",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  itemController.deleteItemPhotoHandler
);

export default router;
