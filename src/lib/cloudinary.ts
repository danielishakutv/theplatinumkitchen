// Server-only Cloudinary helper. Configured from a single CLOUDINARY_URL env
// var (cloudinary://<api_key>:<api_secret>@<cloud_name>) which the SDK reads
// automatically. When it's not set, isCloudinaryConfigured() returns false and
// the admin UI falls back to pasting image URLs by hand.
import "server-only";

import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  return Boolean(process.env.CLOUDINARY_URL);
}

// Where uploads land inside the Cloudinary media library.
const UPLOAD_FOLDER = "platinum-kitchen";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

// Uploads a browser File to Cloudinary and returns the secure CDN URL.
export async function uploadImage(file: File): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new ImageUploadError("Image uploads aren't configured on this server.");
  }
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new ImageUploadError("Use a JPG, PNG, WebP, AVIF or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new ImageUploadError("That image is over 8 MB — pick a smaller one.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: UPLOAD_FOLDER, resource_type: "image" },
      (err, res) => {
        if (err || !res) {
          reject(err ?? new Error("Cloudinary returned no result"));
        } else {
          resolve(res);
        }
      },
    );
    stream.end(buffer);
  });

  return result.secure_url;
}
