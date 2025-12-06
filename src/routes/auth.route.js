import express from "express";
import * as authController from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/ping", authController.pingHandler);
router.post("/admin-login", authController.adminLoginHandler);

export default router;
