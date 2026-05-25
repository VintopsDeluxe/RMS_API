import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import pkg from 'multer-storage-cloudinary';
import multer from 'multer';

// Fallback logic to grab the constructor no matter how Node packages it
const CloudinaryStorage = pkg.CloudinaryStorage || pkg;

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// 2. Setup Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ihs_field_logs',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

// 3. Modern Export
const upload = multer({ storage });
export default upload;
