import { getDb } from "../config/database.config.js";

export const BaseRepository = (collectionName) => ({
  
  findAll: async ({ filter = {}, projection = null, sort = { _id: -1 } } = {}) => {
    const db = await getDb();
    const data = await db
      .collection(collectionName)
      .find(filter, { projection })
      .sort(sort)
      .toArray();
  
    return data;
  },
  
  findMany: async ({
    filter = {},
    projection = null,
    page = 1,
    limit = 10,
    sort = { _id: -1 },
  } = {}) => {
    const db = await getDb();
    const skip = (page - 1) * limit;

    const cursor = db
      .collection(collectionName)
      .find(filter, { projection })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const data = await cursor.toArray();
    const total = await db.collection(collectionName).countDocuments(filter);
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  },

  findById: async (id, projection = null) => {
    const db = await getDb();
    return await db
      .collection(collectionName)
      .findOne({ _id: id }, { projection });
  },

  findOne: async (filter, projection = null) => {
    const db = await getDb();
    return await db.collection(collectionName).findOne(filter, { projection });
  },

  insertOne: async (data) => {
    const db = await getDb();
    return await db.collection(collectionName).insertOne(data);
  },

  updateById: async (id, updateData) => {
    const db = await getDb();
    return await db
      .collection(collectionName)
      .updateOne({ _id: id }, { $set: updateData });
  },

  updateOne: async (filter, updateData) => {
    const db = await getDb();
    return await db
      .collection(collectionName)
      .updateOne(filter, { $set: updateData });
  },

  incrementField: async (id, field, amount) => {
    const db = await getDb();
    return await db
      .collection(collectionName)
      .updateOne({ _id: id }, { $inc: { [field]: amount } });
  },

  getAll: async (projection = null) => {
    const db = await getDb();
    return await db
      .collection(collectionName)
      .find({}, projection ? { projection } : {})
      .toArray();
  },
});