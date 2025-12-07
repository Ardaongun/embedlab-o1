import { getDb } from "../config/database.config.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { BaseRepository } from "./base.repository.js";

const COLLECTION_NAME = "items";

const base = BaseRepository(COLLECTION_NAME);

export const createItemDB = withErrorHandling(base.insertOne);

export const getItemByIdDB = withErrorHandling(base.findById);

export const updateItemByIdDB = withErrorHandling(base.updateById);