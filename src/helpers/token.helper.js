import jwt from "jsonwebtoken";
import { CONFIGS } from "../config/config.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

const accessSecret = CONFIGS.ACCESS_SECRET;
const urlSecret = CONFIGS.URL_SECRET;

export const generateAccessToken = (payload, expiresIn = "60m") => {
  return jwt.sign(payload, accessSecret, { expiresIn });
};

export const generateRefreshToken = async () => {
  const lookupKey = crypto.randomBytes(16).toString("hex");
  const secretKey = crypto.randomBytes(32).toString("hex");

  const refreshToken = `${lookupKey}.${secretKey}`;
  const hashedSecret = await bcrypt.hash(secretKey, 10);

  return {
    refreshToken,
    lookupKey,
    hashedSecret,
  };
};

export const generateSecureUrlToken = (fileUrl) => {
  const payload = {
    fileUrl: fileUrl,
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
  };
  return jwt.sign(payload, urlSecret);
};

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret);

export const verifySecureUrlToken = (token) => jwt.verify(token, urlSecret);
