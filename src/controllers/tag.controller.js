import {
  createTag,
  deleteTag,
  getTagsByOrganization,
  updateTag,
} from "../services/tag.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const createTagHandler = withErrorHandling(async (req, res) => {
  const { name } = req.validated.body;
  const organizationId = req.user.organizationId;
  const createdTag = await createTag(name.trim(), organizationId);
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
  const { tagId } = req.validated.params;
  const { name } = req.validated.body;
  const organizationId = req.user.organizationId;
  await updateTag(tagId, name.trim(), organizationId);
  return Response.success(null, "Tag updated successfully.").send(res);
});

export const deleteTagHandler = withErrorHandling(async (req, res) => {
  const { tagId } = req.validated.params;
  const organizationId = req.user.organizationId;
  await deleteTag(tagId, organizationId);
  return Response.success(null, "Tag deleted successfully.").send(res);
});
