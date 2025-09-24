import { v2 as cloudinary } from "cloudinary";

export const uploadImages = async (file) => {
  if (!file) {
    return null;
  }

  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = "data:" + file.mimetype + ";base64," + b64;

  const response = await cloudinary.uploader.upload(dataURI, {
    resource_type: "auto",
    folder: "donatehub_campaigns",
  });

  return response.secure_url;
};
export const uploadMultipleImages = async (files) => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) => uploadImages(file));
  return Promise.all(uploadPromises);
};
