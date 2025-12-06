import express from "express";

import authRoutes from "./auth.route.js";
import organizationRoutes from "./organization.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);

export default router;
