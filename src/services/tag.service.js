import { getOrganizationByIdDB } from "../repositories/organizations.repository.js";
import {
  createTagDB,
  deleteTagByIdDB,
  getAllTagsDB,
  getTagByIdDB,
  updateTagByIdDB,
} from "../repositories/tags.repository.js";
import ApiError from "../utils/apiError.js";
import { getLogger } from "../utils/context.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export const createTag = withErrorHandling(async (name, organizationId) => {
  const logger = getLogger();
  logger.info({ organizationId, tagName: name }, "Tag creation initiated.");

  const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
  if (!existingOrg) {
    logger.warn(
      { organizationId },
      "Create tag failed: Organization not found."
    );
    throw ApiError.badRequest("Organization does not exist.");
  }

  const newTagId = uuidv4();

  const tag = {
    _id: newTagId,
    name,
    organizationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = await createTagDB(tag);

  logger.info({ tagId: newTagId, organizationId }, "Tag created successfully.");

  return res;
});

export const getTagsByOrganization = withErrorHandling(
  async (organizationId) => {
    const logger = getLogger();
    logger.debug({ organizationId }, "Fetching tags for organization.");

    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      logger.warn(
        { organizationId },
        "Fetch tags failed: Organization not found."
      );
      throw ApiError.badRequest("Organization does not exist.");
    }

    const tags = await getAllTagsDB({
      filter: { organizationId },
    });

    logger.debug(
      { count: tags.length, organizationId },
      "Tags retrieved successfully."
    );

    return tags;
  }
);

export const updateTag = withErrorHandling(
  async (tagId, name, organizationId) => {
    const logger = getLogger();
    logger.info(
      { tagId, newName: name, organizationId },
      "Tag update initiated."
    );

    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      logger.warn(
        { organizationId },
        "Update tag failed: Organization not found."
      );
      throw ApiError.badRequest("Organization does not exist.");
    }

    const existingTag = await getTagByIdDB(tagId);
    if (!existingTag || existingTag.organizationId !== organizationId) {
      logger.warn(
        { tagId, requestOrg: organizationId },
        "Update tag failed: Tag not found or belongs to another organization."
      );
      throw ApiError.badRequest("Tag does not exist in the organization.");
    }

    await updateTagByIdDB(tagId, {
      name,
      updatedAt: new Date(),
    });

    logger.info({ tagId }, "Tag updated successfully.");
  }
);

export const deleteTag = withErrorHandling(async (tagId, organizationId) => {
  const logger = getLogger();
  logger.info({ tagId, organizationId }, "Tag deletion initiated.");

  const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
  if (!existingOrg) {
    logger.warn(
      { organizationId },
      "Delete tag failed: Organization not found."
    );
    throw ApiError.badRequest("Organization does not exist.");
  }

  const existingTag = await getTagByIdDB(tagId);
  if (!existingTag || existingTag.organizationId !== organizationId) {
    logger.warn(
      { tagId, requestOrg: organizationId },
      "Delete tag failed: Tag not found or belongs to another organization."
    );
    throw ApiError.badRequest("Tag does not exist in the organization.");
  }

  await deleteTagByIdDB(tagId);

  logger.info({ tagId }, "Tag deleted successfully.");
});
