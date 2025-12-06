import jwt from 'jsonwebtoken';
import { CONFIGS } from '../config/config.js';
import crypto from "crypto";

const accessSecret = CONFIGS.ACCESS_SECRET;

export const generateAccessToken = (payload, expiresIn = '60m') => {
    return jwt.sign(payload, accessSecret, { expiresIn });
}

export const generateRefreshToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret);