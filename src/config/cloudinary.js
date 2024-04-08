// config/cloudinaryConfig.js
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: "de4aqqalo",
  api_key: "141693993541784",
  api_secret: "RrlS1NDeyTw_nqNnmcH965CCytg",
});

export default cloudinary;
