import multer from "multer";
import { uploadFile } from "../helpers/file.helper.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const handleFileUpload = upload.single("file");

export const fileUploadMiddleware = async (req, res, next) => {
  handleFileUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file." });
    }

    try {
      const fileName = await uploadFile(req.file);
      req.fileName = fileName;
      next();
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while uploading the file." });
    }
  });
};
