import multer from "multer";
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const imageFolderPath = path.join(process.cwd(), "public", "temp");

        if (!fs.existSync(imageFolderPath))
            fs.mkdirSync(imageFolderPath, { recursive: true })

        cb(null, imageFolderPath);
    },

    filename: (req, file, cb) => {
        const uniqueName = "profileImage" + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName)
    },
})

const fileFilter = (req, file, cb) => {

    const supportedImage = ["image/png", "image/jpg", "image/jpeg"];

    if (!supportedImage.includes(file.mimetype))
        return cb(new Error("File type is not allowed. Only png, jpg, jpeg are allowed"), false);

    else cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
})

export default upload;