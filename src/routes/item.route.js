import express from "express";
import * as itemController from "../controllers/item.controller.js";
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js";
import { ROLES } from "../config/role.config.js";
import { fileUploadMiddleware } from "../middlewares/fileUpload.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { addItemSchema, getItemByIdSchema, getItemsQuerySchema } from "../schemas/item.schema.js";

const router = express.Router();

router.get(
  "/get-items",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  validateRequest(getItemsQuerySchema),
  itemController.getItemsHandler
);

router.get(
  "/get-item/:itemId",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  validateRequest(getItemByIdSchema),
  itemController.getItemByIdHandler
);

router.post(
  "/add-item",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  validateRequest(addItemSchema),
  itemController.addItemHandler
);

router.post(
  "/add-item-photo",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  fileUploadMiddleware,
  itemController.addItemPhotoHandler
);

router.patch(
  "/update-item/:itemId",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  itemController.updateItemByIdHandler
);

router.delete(
  "/delete-item-photo/:photoId",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  itemController.deleteItemPhotoHandler
);

router.delete(
  "/delete-item/:itemId",
  authorizeMiddleware(ROLES.USER, ROLES.ORGANIZATION),
  itemController.deleteItemByIdHandler
);

export default router;
