import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const organizationId =
            req.user.organizationId;

        const uploadPath = path.join(
            "uploads",
            "organizations",
            String(organizationId)
        );

        fs.mkdirSync(uploadPath, {
            recursive: true
        });

        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const extension =
            path.extname(file.originalname);

        cb(
            null,
            `logo-${Date.now()}${extension}`
        );
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/svg+xml"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error("Only PNG, JPG and SVG files are allowed.");
        error.statusCode = 400;
        return cb(error);
    }

    cb(null, true);
};

export const uploadLogoMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});