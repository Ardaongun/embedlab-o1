import { getDb } from "../config/database.config.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { BaseRepository } from "./base.repository.js";

const COLLECTION_NAME = "items";

const base = BaseRepository(COLLECTION_NAME);

export const getItemsDB = withErrorHandling(base.findMany);

export const getItemByIdDB = withErrorHandling(base.findById);

export const createItemDB = withErrorHandling(base.insertOne);

export const updateItemByIdDB = withErrorHandling(base.updateById);

export const deleteItemByIdDB = withErrorHandling(base.deleteById);
