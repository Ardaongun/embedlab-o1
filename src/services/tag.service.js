import { getOrganizationByIdDB } from "../repositories/organizations.repository.js";
import {
  createTagDB,
  getAllTagsDB,
  getTagByIdDB,
  updateTagByIdDB,
} from "../repositories/tags.repository.js";
import ApiError from "../utils/apiError.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export const createTag = withErrorHandling(async (name, organizationId) => {
  const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
  if (!existingOrg) {
    throw ApiError.badRequest("Organization does not exist.");
  }

  const tag = {
    _id: uuidv4(),
    name,
    organizationId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = await createTagDB(tag);

  return res;
});

export const getTagsByOrganization = withErrorHandling(
  async (organizationId) => {
    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      throw ApiError.badRequest("Organization does not exist.");
    }

    const tags = await getAllTagsDB({
      filter: { organizationId },
    });
    return tags;
  }
);

export const updateTag = withErrorHandling(
  async (tagId, name, organizationId) => {
    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      throw ApiError.badRequest("Organization does not exist.");
    }

    const existingTag = await getTagByIdDB(tagId);
    if (!existingTag || existingTag.organizationId !== organizationId) {
      throw ApiError.badRequest("Tag does not exist in the organization.");
    }

    await updateTagByIdDB(tagId, {
      name,
      updatedAt: new Date(),
    });
  }
);
