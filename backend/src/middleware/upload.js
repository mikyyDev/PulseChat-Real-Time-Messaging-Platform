import multer from "multer";

// Memory storage keeps the file buffer in memory for immediate Cloudinary upload
const storage = multer.memoryStorage();

// Only accept image files (jpeg, png, gif)
const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpe?g|png|gif)$/i;
  if (allowed.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, gif)"), false);
  }
};

export const uploadProfilePic = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("profilePic");
