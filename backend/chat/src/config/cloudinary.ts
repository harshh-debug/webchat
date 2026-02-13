import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
const { CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
	throw new Error("Missing Cloudinary envs");
}
cloudinary.config({
	cloud_name: CLOUD_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary