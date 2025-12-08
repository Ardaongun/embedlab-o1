import express from "express";

import authRoutes from "./auth.route.js";
import organizationRoutes from "./organization.route.js";
import tagRoutes from "./tag.route.js";
import itemRoutes from "./item.route.js";
import fileRoutes from "./file.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/tags", tagRoutes);
router.use("/items", itemRoutes);
router.use("/files", fileRoutes);

export default router;
