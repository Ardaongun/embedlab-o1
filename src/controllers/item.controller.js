import {
  addItemPhoto,
  createItem,
  deleteItemById,
  deleteItemPhoto,
  getItemById,
  getItems,
  updateItemById,
} from "../services/item.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const deleteItemByIdHandler = withErrorHandling(async (req, res) => {
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;

  const { itemId } = req.params;

  await deleteItemById(organizationId, userId, itemId);
  return Response.success(null, "Item deleted successfully.").send(res);
});

export const getItemByIdHandler = withErrorHandling(async (req, res) => {
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;
  const { itemId } = req.params;

  const item = await getItemById(organizationId, userId, itemId);
  return Response.success(item, "Item retrieved successfully.").send(res);
});

export const getItemsHandler = withErrorHandling(async (req, res) => {
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;
  const { page = 1, limit = 10, tags, searchTerm, sort, onlyOwn } = req.query;

  const items = await getItems(
    organizationId,
    userId,
    tags,
    searchTerm,
    sort,
    onlyOwn,
    parseInt(page),
    parseInt(limit)
  );
  return Response.success(items, "Items retrieved successfully.").send(res);
});

export const updateItemByIdHandler = withErrorHandling(async (req, res) => {
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;
  const { name, description, value, tags } = req.body;
  const { itemId } = req.params;

  await updateItemById(
    organizationId,
    userId,
    itemId,
    name,
    description,
    value,
    tags
  );
  return Response.success(null, "Item updated successfully").send(res);
});

export const addItemHandler = withErrorHandling(async (req, res) => {
  const { name, description, value, tags } = req.body;
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
  const fileUrl = req.fileName;
  const { itemId } = req.body;
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;

  await addItemPhoto(userId, organizationId, itemId, fileUrl);
  return Response.success(null, "Item photo added successfully.").send(res);
});

export const deleteItemPhotoHandler = withErrorHandling(async (req, res) => {
  const { photoId } = req.params;
  const { itemId } = req.body;
  
  const organizationId = req.user.organizationId;
  const userId = req.user.userId;

  await deleteItemPhoto(userId, organizationId, itemId, photoId);
  return Response.success(null, "Item photo deleted successfully.").send(res);
});
