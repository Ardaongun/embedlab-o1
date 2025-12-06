import { getDb } from "../config/database.config.js";
import { withErrorHandling } from "../utils/errorHandler.js";
import { BaseRepository } from "./base.repository.js";

const COLLECTION_NAME = "organizations";

const base = BaseRepository(COLLECTION_NAME);

export const createOrganizationDB = withErrorHandling(base.insertOne);

export const getAllOrganizationsDB = withErrorHandling(base.findAll);