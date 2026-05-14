"use server";

import { auth } from "@/lib/auth";
import { ImageUploadError, uploadImage } from "@/lib/cloudinary";

interface OkResult {
  ok: true;
  url: string;
}
interface ErrResult {
  ok: false;
  error: string;
}
export type UploadImageResult = OkResult | ErrResult;

// Shared by every admin form that needs an image (menu items, site settings).
// Staff-only — customers have no business uploading to the media library.
export async function uploadImageAction(
  formData: FormData,
): Promise<UploadImageResult> {
  const session = await auth();
  if (!session?.user || session.user.role === "customer") {
    return { ok: false, error: "You don't have permission to upload images." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Pick an image file to upload." };
  }

  try {
    const url = await uploadImage(file);
    return { ok: true, url };
  } catch (err) {
    if (err instanceof ImageUploadError) {
      return { ok: false, error: err.message };
    }
    console.error("[admin/upload] unexpected error", err);
    return { ok: false, error: "Upload failed. Please try again." };
  }
}
