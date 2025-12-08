import express from 'express';
import { verifySecureUrlToken } from '../helpers/token.helper.js';
import { getFile } from '../helpers/file.helper.js';
import path from "path";
import mime from "mime-types";
import Response from '../utils/response.js';

const router = express.Router();

router.get('/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = verifySecureUrlToken(token);
        const { fileUrl } = decoded;
        const fileData = await getFile(fileUrl);
        const ext = path.extname(fileUrl);
        const contentType = mime.lookup(ext) || 'application/octet-stream';
        res.set({
            'Content-Type': contentType
        });
        res.send(fileData);
    } catch (error) {
       return Response.error().send(res);
    }
});

export default router;