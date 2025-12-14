import {
  createOrganizationDB,
  getAllOrganizationsDB,
} from "../repositories/organizations.repository.js";
import ApiError from "../utils/apiError.js";
import { getLogger } from "../utils/context.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export const createOrganization = withErrorHandling(async (name) => {
  const logger = getLogger();
  logger.info({ organizationName: name }, "Organization creation initiated.");

  const newOrgId = uuidv4();
  const organization = {
    _id: newOrgId,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdOrg = await createOrganizationDB(organization);

  logger.info(
    { organizationId: newOrgId, organizationName: name },
    "Organization created successfully."
  );

  return createdOrg;
});

export const getAllOrganizations = withErrorHandling(async () => {
  const logger = getLogger();
  logger.debug("Fetching all organizations.");

  const organizations = await getAllOrganizationsDB();
  logger.debug(
    { count: organizations.length },
    "Organizations retrieved successfully."
  );
  return organizations;
});
