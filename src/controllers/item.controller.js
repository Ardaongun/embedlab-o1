import {
  addItemPhoto,
  createItem,
  deleteItemPhoto,
} from "../services/item.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const addItemHandler = withErrorHandling(async (req, res) => {
  const { name, description, value, tags } = req.body;

  if (!name || !description) {
    return Response.badRequest(res, "Name and description are required.").send(
      res
    );
  }
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;

  const createdItem = await createItem(
    userId,
    organizationId,
    name,
    description,
    value,
    tags
  );
  return Response.created(createdItem, "Item created successfully.").send(res);
});

export const addItemPhotoHandler = withErrorHandling(async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) {
    return Response.badRequest("Item ID is required").send(res);
  }
  const fileUrl = req.fileName;
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;

  await addItemPhoto(userId, organizationId, itemId, fileUrl);
  return Response.success(null, "Item photo added successfully.").send(res);
});

export const deleteItemPhotoHandler = withErrorHandling(async (req, res) => {
  const { photoId } = req.params;
  if (!photoId) {
    return Response.badRequest("Photo ID is required").send(res);
  }

  const { itemId } = req.body;
  if (!itemId) {
    return Response.badRequest("Item ID is required").send(res);
  }
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;

  await deleteItemPhoto(userId, organizationId, itemId, photoId);
  return Response.success(null, "Item photo deleted successfully.").send(res);
});
