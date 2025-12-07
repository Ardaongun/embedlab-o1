import { createItem } from "../services/item.service.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import Response from "../utils/response.js";

export const addItemHandler = withErrorHandling(async (req, res) => {
  const { name, description, value, tags } = req.body;

  if (!name || !description) {
    return Response.badRequest(res, "Name and description are required.").send(
      res
    );
  }
  const organizationId = req.user.organizationId;

  const createdItem = await createItem(
    organizationId,
    name,
    description,
    value,
    tags
  );
  return Response.created(createdItem, "Item created successfully.").send(res);
});
