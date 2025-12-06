import {
  createOrganization,
  getAllOrganizations,
} from "../services/organization.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const createOrganizationHandler = withErrorHandling(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return Response.badRequest(res, "Organization name is required.").send(res);
  }

  const result = await createOrganization(name.trim());
  return Response.success(result, "Organization created successfully.").send(res);
});

export const getAllOrganizationsHandler = withErrorHandling(
  async (req, res) => {
    const organizations = await getAllOrganizations();
    return Response.success(
      organizations,
      "Organizations retrieved successfully.",
    ).send(res);
  }
);
