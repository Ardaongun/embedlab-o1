import { getDb } from "../config/database.config.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { BaseRepository } from "./base.repository.js";

const COLLECTION_NAME = "organizations";

const base = BaseRepository(COLLECTION_NAME);

export const createTagDB = withErrorHandling(base.insertOne);

export const getAllTagsDB = withErrorHandling(base.findAll);

export const getTagByIdDB = withErrorHandling(base.findById);

export const updateTagByIdDB = withErrorHandling(base.updateById);