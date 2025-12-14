import { deleteFile } from "../helpers/file.helper.js";
import { generateSecureUrlToken } from "../helpers/token.helper.js";
import {
  createItemDB,
  deleteItemByIdDB,
  getItemByIdDB,
  getItemsDB,
  updateItemByIdDB,
} from "../repositories/items.repository.js";
import { getOrganizationByIdDB } from "../repositories/organizations.repository.js";
import { getAllTagsDB } from "../repositories/tags.repository.js";
import { getUserByIdDB } from "../repositories/users.repository.js";
import ApiError from "../utils/apiError.js";
import { getLogger } from "../utils/context.js";
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
    const logger = getLogger();
    logger.debug(
      {
        organizationId,
        userId,
        filters: { tags, searchTerm, sort, onlyOwn },
        pagination: { page, limit },
      },
      "Items fetch initiated with criteria."
    );
    const [existingOrg, existingUser] = await Promise.all([
      getOrganizationByIdDB(organizationId, { _id: 1 }),
      getUserByIdDB(userId, { _id: 1 }),
    ]);

    if (!existingOrg) {
      logger.warn(
        { organizationId },
        "Fetch items failed: Organization not found."
      );
      throw ApiError.notFound("Organization does not exist.");
    }

    if (!existingUser) {
      logger.warn({ userId }, "Fetch items failed: User not found.");
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

    logger.debug(
      {
        resultCount: items.length,
        totalItems: pagination.totalItems,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
      },
      "Items fetched successfully."
    );

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
    const logger = getLogger();
    logger.debug(
      { organizationId, userId, itemId },
      "Item retrieval initiated."
    );
    const [existingOrg, existingUser] = await Promise.all([
      getOrganizationByIdDB(organizationId, { _id: 1 }),
      getUserByIdDB(userId, { _id: 1 }),
    ]);

    if (!existingOrg) {
      logger.warn(
        { organizationId },
        "Item retrieval failed: Organization not found."
      );
      throw ApiError.notFound("Organization does not exist.");
    }

    if (!existingUser) {
      logger.warn({ userId }, "Item retrieval failed: User not found.");
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
      logger.warn(
        { itemId, organizationId },
        "Item retrieval failed: Item not found or belongs to another organization."
      );
      throw ApiError.notFound("Item does not exist.");
    }
    const populatedItem = await populateItemDetails(item);

    logger.debug({ itemId }, "Item details retrieved successfully.");
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
    const logger = getLogger();
    logger.info(
      { userId, organizationId, itemName: name },
      "Item creation process initiated."
    );

    const [existingOrg, existingUser] = await Promise.all([
      getOrganizationByIdDB(organizationId, { _id: 1 }),
      getUserByIdDB(userId, { _id: 1 }),
    ]);
    if (!existingOrg) {
      logger.warn(
        { organizationId },
        "Item creation failed: Organization not found."
      );
      throw ApiError.notFound("Organization does not exist.");
    }

    if (!existingUser) {
      logger.warn({ userId }, "Item creation failed: User not found.");
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
        logger.warn(
          {
            providedTags: tags,
            foundCount: foundTags.length,
          },
          "Item creation failed: One or more tags do not exist in the organization."
        );
        throw ApiError.notFound(
          "One or more tags do not exist in the organization."
        );
      }
    }

    const newItemId = uuidv4();

    const newItem = {
      _id: newItemId,
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

    logger.info(
      {
        itemId: newItemId,
        userId,
        organizationId,
      },
      "Item created successfully."
    );

    return newItem;
  }
);

/**
 * Adds a photo to an existing item
 * @param {string} userId - The ID of the user adding the photo
 * @param {string} organizationId - The ID of the organization
 * @param {string} itemId - The ID of the item to add the photo to
 * @param {string} fileUrl - The file path/URL of the uploaded photo
 * @returns {Promise<void>}
 * @throws {ApiError} If item not found or user lacks permission
 */
export const addItemPhoto = withErrorHandling(
  async (userId, organizationId, itemId, fileUrl) => {
    const logger = getLogger();
    logger.info({ userId, itemId, fileUrl }, "Item photo addition initiated.");
    const item = await getItemByIdDB(itemId);
    if (!item) {
      logger.warn(
        { itemId, fileUrl },
        "Add photo failed: Item not found. Deleting uploaded file to prevent orphans."
      );
      deleteFile(fileUrl);
      throw ApiError.notFound("Item not found.");
    }

    if (item.organizationId !== organizationId) {
      logger.warn(
        {
          itemId,
          requestOrg: organizationId,
          itemOrg: item.organizationId,
        },
        "Add photo failed: Organization mismatch. Deleting uploaded file."
      );
      deleteFile(fileUrl);
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    if (item.createdBy !== userId) {
      logger.warn(
        {
          requesterId: userId,
          ownerId: item.createdBy,
          itemId,
        },
        "Add photo failed: Permission denied (Not owner). Deleting uploaded file."
      );
      deleteFile(fileUrl);
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    const imageId = uuidv4();

    const itemImage = {
      id: imageId,
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

    logger.info(
      { itemId, imageId, fileUrl },
      "Photo added to item successfully."
    );
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
    const logger = getLogger();
    logger.info(
      { userId, itemId, photoId },
      "Photo deletion process initiated."
    );

    const item = await getItemByIdDB(itemId);
    if (!item) {
      logger.warn({ itemId, photoId }, "Delete photo failed: Item not found.");
      throw ApiError.notFound("Item not found.");
    }

    if (item.organizationId !== organizationId) {
      logger.warn(
        {
          itemId,
          requestOrg: organizationId,
          itemOrg: item.organizationId,
        },
        "Delete photo failed: Organization mismatch."
      );
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    if (item.createdBy !== userId) {
      logger.warn(
        {
          requesterId: userId,
          ownerId: item.createdBy,
          itemId,
        },
        "Delete photo failed: Permission denied (User is not the owner)."
      );
      throw ApiError.forbidden(
        "You do not have permission to modify this item."
      );
    }

    const imageToDelete = item.images.find((img) => img.id === photoId);
    if (!imageToDelete) {
      logger.warn(
        { itemId, photoId }, 
        "Delete photo failed: Photo ID not found in item."
      );
      throw ApiError.notFound("Photo not found.");
    }
    const newImages = item.images.filter((image) => image.id !== photoId);
    await updateItemByIdDB(itemId, {
      images: newImages,
      updatedAt: new Date(),
    });
    deleteFile(imageToDelete.url);

    logger.info(
      { 
        itemId, 
        photoId, 
        deletedUrl: imageToDelete.url 
      }, 
      "Photo deleted successfully from DB and storage."
    );
  }
);

/**
 * Deletes an item by its ID
 * @param {string} organizationId - The ID of the organization
 * @param {string} userId - The ID of the user requesting the deletion
 * @param {string} itemId - The ID of the item to delete
 * @returns {Promise<void>}
 * @throws {ApiError} If organization, user, or item don't exist, or user lacks permission
 */
export const deleteItemById = withErrorHandling(
  async (organizationId, userId, itemId) => {
    const logger = getLogger();
    logger.info(
      { organizationId, userId, itemId },
      "Item deletion process initiated."
    );
    const [existingOrg, existingUser] = await Promise.all([
      getOrganizationByIdDB(organizationId, { _id: 1 }),
      getUserByIdDB(userId, { _id: 1 }),
    ]);

    if (!existingOrg) {
      logger.warn(
        { organizationId },
        "Item deletion failed: Organization not found."
      );
      throw ApiError.notFound("Organization does not exist.");
    }

    if (!existingUser) {
      logger.warn({ userId }, "Item deletion failed: User not found.");
      throw ApiError.notFound("User does not exist.");
    }

    const item = await getItemByIdDB(itemId);
    if (!item || item.organizationId !== organizationId) {
      logger.warn(
        { itemId, organizationId },
        "Item deletion failed: Item not found or belongs to another organization."
      );
      throw ApiError.notFound("Item does not exist.");
    }

    if (item.createdBy !== userId) {
      logger.warn(
        {
          requesterId: userId,
          itemOwnerId: item.createdBy,
          itemId,
        },
        "Item deletion failed: Permission denied (User is not the owner)."
      );
      throw ApiError.forbidden(
        "You do not have permission to delete this item."
      );
    }

    if (Array.isArray(item.images)) {
      logger.debug(
        { imageCount: item.images.length, itemId },
        "Deleting associated item images."
      );

      for (const image of item.images) {
        deleteFile(image.url);
      }
    }

    await deleteItemByIdDB(itemId);

    logger.info(
      { itemId, userId, organizationId },
      "Item deleted successfully."
    );
  }
);

export const updateItemById = withErrorHandling(
  async (organizationId, userId, itemId, name, description, value, tags) => {
    const logger = getLogger();

    const requestedChanges = Object.keys({
      name,
      description,
      value,
      tags,
    }).filter(
      (key) =>
        [name, description, value, tags].includes(key) && key !== undefined
    );

    logger.info(
      { organizationId, userId, itemId, fieldsToUpdate: requestedChanges },
      "Item update process initiated."
    );

    const [existingOrg, existingUser] = await Promise.all([
      getOrganizationByIdDB(organizationId, { _id: 1 }),
      getUserByIdDB(userId, { _id: 1 }),
    ]);

    if (!existingOrg) {
      logger.warn({ organizationId }, "Update failed: Organization not found.");
      throw ApiError.notFound("Organization does not exist.");
    }

    if (!existingUser) {
      logger.warn({ userId }, "Update failed: User not found.");
      throw ApiError.notFound("User does not exist.");
    }

    const item = await getItemByIdDB(itemId);
    if (!item) {
      logger.warn({ itemId }, "Update failed: Item not found.");
      throw ApiError.notFound("Item not found.");
    }

    if (item.organizationId !== organizationId || item.createdBy !== userId) {
      logger.warn(
        {
          requesterId: userId,
          ownerId: item.createdBy,
          itemId,
          requestOrg: organizationId,
          itemOrg: item.organizationId,
        },
        "Update failed: Permission denied (User is not the owner or organization mismatch)."
      );
      throw ApiError.forbidden(
        "You do not have permission to update this item."
      );
    }

    let finalTags = item.tags;
    if (tags !== undefined) {
      if (Array.isArray(tags) && tags.length === 0) {
        finalTags = [];
      } else if (Array.isArray(tags) && tags.length > 0) {
        const foundTags = await getAllTagsDB({
          filter: { _id: { $in: tags }, organizationId },
        });

        if (foundTags.length !== tags.length) {
          logger.warn(
            { providedTags: tags, foundTagsCount: foundTags.length },
            "Update failed: One or more provided tags do not exist in the organization."
          );
          throw ApiError.notFound(
            "One or more tags do not exist in the organization."
          );
        }

        finalTags = tags;
      }
    }

    const rawData = {
      name,
      description,
      value,
      tags: finalTags,
      updatedAt: new Date(),
    };
    const updateData = {};

    Object.entries(rawData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await updateItemByIdDB(itemId, updateData);

    logger.info(
      { itemId, updatedFields: Object.keys(updateData) },
      "Item updated successfully."
    );
  }
);
