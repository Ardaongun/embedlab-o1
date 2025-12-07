import { createItemDB } from "../repositories/items.repository.js";
import { getOrganizationByIdDB } from "../repositories/organizations.repository.js";
import ApiError from "../utils/apiError.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export const createItem = withErrorHandling(
  async (organizationId, name, description, value, tags) => {
    const existingOrg = await getOrganizationByIdDB(organizationId, { _id: 1 });
    if (!existingOrg) {
      throw ApiError.badRequest("Organization does not exist.");
    }

    if (tags && tags.length > 0) {
      const foundTags = await getAllTagsDB({
        filter: {
          _id: { $in: tags },
          organizationId,
        },
      });

      if (foundTags.length !== tags.length) {
        throw ApiError.badRequest(
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
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createItemDB(newItem);

    return newItem;
  }
);
