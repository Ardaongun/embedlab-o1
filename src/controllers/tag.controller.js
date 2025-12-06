import {
  createTag,
  deleteTag,
  getTagsByOrganization,
  updateTag,
} from "../services/tag.service.js";
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

export const updateTagHandler = withErrorHandling(async (req, res) => {
  const { tagId } = req.params;
  const { name } = req.body;

  if (!tagId) {
    return Response.badRequest("Tag ID is required.").send(res);
  }

  if (!name || name.trim() === "") {
    return Response.badRequest("Tag name is required.").send(res);
  }

  await updateTag(tagId, name.trim(), req.user.organizationId);
  return Response.success(null, "Tag updated successfully.").send(res);
});

export const deleteTagHandler = withErrorHandling(async (req, res) => {
  const { tagId } = req.params;
  if (!tagId) {
    return Response.badRequest("Tag ID is required.").send(res);
  }
  await deleteTag(tagId, req.user.organizationId);
  return Response.success(null, "Tag deleted successfully.").send(res);
});
