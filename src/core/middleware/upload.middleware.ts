import multer from "multer";
import path from "path";

/**
 * 1️⃣ Cấu hình nơi lưu file tạm
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
    console.log(process.cwd());
  },

  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

/**
 * 2️⃣ Filter chỉ cho upload image
 */
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

/**
 * 3️⃣ Khởi tạo multer
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB / image
  },
});

/**
 * 4️⃣ Export middleware
 */

// Upload 1 ảnh
export const uploadSingleImage = upload.single("image");

// Upload nhiều ảnh (tối đa 5)
export const uploadMultipleImages = upload.array("images", 5);
