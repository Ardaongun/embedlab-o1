import { createOrganizationDB, getAllOrganizationsDB } from "../repositories/organizations.repository.js";
import ApiError from "../utils/apiError.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export const createOrganization = withErrorHandling(async (name) => {
  const organization = {
    _id: uuidv4(),
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdOrg = await createOrganizationDB(organization);
  return createdOrg;
});

export const getAllOrganizations = withErrorHandling(async () => {
  const organizations = await getAllOrganizationsDB();
  return organizations;
})
