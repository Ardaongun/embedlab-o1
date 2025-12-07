import { deleteFile } from "../helpers/file.helper.js";
import {
  createItemDB,
  getItemByIdDB,
  updateItemByIdDB,
} from "../repositories/items.repository.js";
import { getOrganizationByIdDB } from "../repositories/organizations.repository.js";
import { getAllTagsDB } from "../repositories/tags.repository.js";
import { getUserByIdDB } from "../repositories/users.repository.js";
import ApiError from "../utils/apiError.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export const createItem = withErrorHandling(
  async (userId, organizationId, name, description, value, tags) => {
    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      throw ApiError.notFound("Organization does not exist.");
    }

    const existingUser = await getUserByIdDB(userId, { _id: 1 });
    if (!existingUser) {
      throw ApiError.notFound("User does not exist.");
    }

    if (tags && tags.length > 0) {
      const foundTags = await getAllTagsDB({
        filter: {
          _id: { $in: tags },
          organizationId,
        },
      });

      if (foundTags.length !== tags.length) {
        throw ApiError.notFound(
          "One or more tags do not exist in the organization."
        );
      }
    }

    const newItem = {
      _id: uuidv4(),
      name,
      description,
      value: value || 0,
      images: [],
      tags: tags || [],
      createdBy: userId,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createItemDB(newItem);

    return newItem;
  }
);

export const addItemPhoto = withErrorHandling(
  async (userId, organizationId, itemId, fileUrl) => {
    const item = await getItemByIdDB(itemId);
    if (!item) {
      throw ApiError.notFound("Item not found.");
    }

    if (item.organizationId !== organizationId) {
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    if (item.createdBy !== userId) {
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    const itemImage = {
      id: uuidv4(),
      url: fileUrl,
      uploadedAt: new Date(),
    };

    if (!item.images) {
      item.images = [];
    }
    item.images.push(itemImage);

    await updateItemByIdDB(itemId, {
      images: item.images,
      updatedAt: new Date(),
    });
  }
);

export const deleteItemPhoto = withErrorHandling(
  async (userId, organizationId, itemId, photoId) => {
    const item = await getItemByIdDB(itemId);
    if (!item) {
      throw ApiError.notFound("Item not found.");
    }

    if (item.organizationId !== organizationId) {
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    if (item.createdBy !== userId) {
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    const newImages = item.images.filter((image) => image.id !== photoId);
    deleteFile(item.images.find((img) => img.id === photoId).url)
    await updateItemByIdDB(itemId, {
      images: newImages,
      updatedAt: new Date(),
    });
  }
);
