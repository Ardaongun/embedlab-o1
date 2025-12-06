import { createTag, getTagsByOrganization } from "../services/tag.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const createTagHandler = withErrorHandling(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return Response.badRequest("Tag name is required.").send(res);
  }

  const createdTag = await createTag(name.trim(), req.user.organizationId);
  return Response.created(createdTag, "Tag created successfully.").send(res);
});

export const getTagsByOrganizationHandler = withErrorHandling(
  async (req, res) => {
    const organizationId = req.user.organizationId;

    const tags = await getTagsByOrganization(organizationId);
    return Response.success(tags, "Tags retrieved successfully.").send(res);
  }
);
