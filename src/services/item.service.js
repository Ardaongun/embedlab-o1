import { deleteFile } from "../helpers/file.helper.js";
import { generateSecureUrlToken } from "../helpers/token.helper.js";
import {
  createItemDB,
  getItemByIdDB,
  getItemsDB,
  updateItemByIdDB,
} from "../repositories/items.repository.js";
import { getOrganizationByIdDB } from "../repositories/organizations.repository.js";
import { getAllTagsDB } from "../repositories/tags.repository.js";
import { getUserByIdDB } from "../repositories/users.repository.js";
import ApiError from "../utils/apiError.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

const uniq = (arr) => [...new Set(arr)];
const makeMapById = (arr) => {
  const m = new Map();
  for (const item of arr || []) {
    if (item && item._id != null) m.set(item._id, item);
  }
  return m;
};

const populateItemDetails = withErrorHandling(async (item) => {
  const tagIds = uniq(item.tags || []);

  const tags = tagIds.length
    ? await getAllTagsDB({
        filter: { _id: { $in: tagIds } },
        projection: { _id: 1, name: 1 },
      })
    : [];
  const tagMap = makeMapById(tags);

  const resolvedTags = Array.isArray(item.tags)
    ? item.tags.map((tagId) => tagMap.get(tagId)).filter(Boolean)
    : [];

  const imagesWithUrl = Array.isArray(item.images)
    ? item.images.map((image) => ({
        id: image.id,
        url: generateSecureUrlToken(image.url),
        uploadedAt: image.uploadedAt,
      }))
    : [];

  const populatedItem = {
    _id: item._id,
    name: item.name,
    description: item.description,
    value: item.value,
    images: imagesWithUrl,
    tags: resolvedTags,
    createdBy: item.createdBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  return populatedItem;
});

const populateItemsDetails = withErrorHandling(async (items) => {
  if (!items || items.length === 0) return [];

  const allTagIds = uniq(
    items
      .flatMap((item) => (Array.isArray(item.tags) ? item.tags : []))
      .filter((v) => v != null)
  );

  const tags = allTagIds.length
    ? await getAllTagsDB({
        filter: { _id: { $in: allTagIds } },
        projection: { _id: 1, name: 1 },
      })
    : [];
  const tagMap = makeMapById(tags);

  const populatedItems = items.map((item) => {
    const resolvedTags = Array.isArray(item.tags)
      ? item.tags.map((tagId) => tagMap.get(tagId)).filter(Boolean)
      : [];

    const image =
      Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : null;

    const imageWithUrl = image
      ? {
          id: image.id,
          url: generateSecureUrlToken(image.url),
          uploadedAt: image.uploadedAt,
        }
      : null;

    return {
      _id: item._id,
      name: item.name,
      description: item.description,
      value: item.value,
      image: imageWithUrl,
      tags: resolvedTags,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  return populatedItems;
});

/**
 * Retrieves multiple items based on filter criteria
 * @param {string} organizationId - The ID of the organization
 * @param {string} userId - The ID of the user requesting the items
 * @param {string[]} [tags] - Optional array of tag IDs to filter by
 * @param {string} [searchTerm] - Optional search term to filter by name or description
 * @param {string} [sort] - Sort order: 'newest', 'oldest', 'a-z', or 'z-a'
 * @param {string} [onlyOwn] - Filter to show only user's own items ('true'/'false')
 * @param {number} [page] - Page number for pagination
 * @param {number} [limit] - Number of items per page
 * @returns {Promise<Object>} Object containing items array and pagination info
 * @throws {ApiError} If organization or user don't exist
 */
export const getItems = withErrorHandling(
  async (
    organizationId,
    userId,
    tags,
    searchTerm,
    sort,
    onlyOwn,
    page,
    limit
  ) => {
    const [existingOrg, existingUser] = await Promise.all([
      getOrganizationByIdDB(organizationId, { _id: 1 }),
      getUserByIdDB(userId, { _id: 1 }),
    ]);

    if (!existingOrg) {
      throw ApiError.notFound("Organization does not exist.");
    }

    if (!existingUser) {
      throw ApiError.notFound("User does not exist.");
    }

    const filter = { organizationId };

    if (onlyOwn === "true") {
      filter.createdBy = userId;
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "a-z":
        sortOption = { name: 1 };
        break;
      case "z-a":
        sortOption = { name: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const projection = {
      _id: 1,
      name: 1,
      description: 1,
      value: 1,
      images: { $slice: 1 },
      tags: 1,
      createdAt: 1,
      updatedAt: 1,
    };

    const { data, pagination } = await getItemsDB({
      filter,
      projection,
      page,
      limit,
      sort: sortOption,
    });
    const items = await populateItemsDetails(data);

    return { items, pagination };
  }
);

/**
 * Retrieves an item by its ID
 * @param {string} organizationId - The ID of the organization
 * @param {string} userId - The ID of the user requesting the item
 * @returns {Promise<Object>}  The item object
 * @throws {ApiError} If organization, user, or tags don't exist
 */
export const getItemById = withErrorHandling(
  async (organizationId, userId, itemId) => {
    const [existingOrg, existingUser] = await Promise.all([
      getOrganizationByIdDB(organizationId, { _id: 1 }),
      getUserByIdDB(userId, { _id: 1 }),
    ]);

    if (!existingOrg) {
      throw ApiError.notFound("Organization does not exist.");
    }

    if (!existingUser) {
      throw ApiError.notFound("User does not exist.");
    }

    const item = await getItemByIdDB(itemId, {
      _id: 1,
      name: 1,
      description: 1,
      value: 1,
      images: 1,
      organizationId: 1,
      tags: 1,
      createdBy: 1,
      createdAt: 1,
      updatedAt: 1,
    });
    if (!item || item.organizationId !== organizationId) {
      throw ApiError.notFound("Item does not exist.");
    }
    const populatedItem = await populateItemDetails(item);
    return populatedItem;
  }
);

/**
 * Creates a new item in the system
 * @param {string} userId - The ID of the user creating the item
 * @param {string} organizationId - The ID of the organization
 * @param {string} name - The name of the item
 * @param {string} description - The description of the item
 * @param {number} [value] - The value of the item (defaults to 0)
 * @param {string[]} [tags] - Array of tag IDs to associate with the item
 * @returns {Promise<Object>} The created item object
 * @throws {ApiError} If organization, user, or tags don't exist
 */
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
      deleteFile(fileUrl);
      throw ApiError.notFound("Item not found.");
    }

    if (item.organizationId !== organizationId) {
      deleteFile(fileUrl);
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    if (item.createdBy !== userId) {
      deleteFile(fileUrl);
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

/**
 * Deletes a photo from an item
 * @param {string} userId - The ID of the user deleting the photo
 * @param {string} organizationId - The ID of the organization
 * @param {string} itemId - The ID of the item containing the photo
 * @param {string} photoId - The ID of the photo to delete
 * @returns {Promise<void>}
 * @throws {ApiError} If item or photo not found, or user lacks permission
 */
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

    const imageToDelete = item.images.find((img) => img.id === photoId);
    if (!imageToDelete) {
      throw ApiError.notFound("Photo not found.");
    }
    const newImages = item.images.filter((image) => image.id !== photoId);
    await updateItemByIdDB(itemId, {
      images: newImages,
      updatedAt: new Date(),
    });
    deleteFile(imageToDelete.url);
  }
);
