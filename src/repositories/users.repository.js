import { getDb } from "../config/database.config.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { BaseRepository } from "./base.repository.js";

const COLLECTION_NAME = "users";

const base = BaseRepository(COLLECTION_NAME);

export const getOneUserDB = withErrorHandling(base.findOne);

export const getUserByIdDB = withErrorHandling(base.findById);

export const createUserDB = withErrorHandling(base.insertOne);

export const updateUserByIdDB = withErrorHandling(base.updateById);
