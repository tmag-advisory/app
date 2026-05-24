import toast from "react-hot-toast";

export const ACCEPTED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png"] as const;
export const IMAGE_ACCEPT = ACCEPTED_IMAGE_MIME_TYPES.join(",");
// Mixed mode: images restricted to JPEG/PNG, still allow document types.
export const IMAGE_OR_DOC_ACCEPT = `${IMAGE_ACCEPT},.pdf,.doc,.docx`;

export function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
}

// Strict: file must be JPEG or PNG.
export function validateImageFile(file: File): boolean {
  if (!isAcceptedImage(file)) {
    toast.error("Only JPEG or PNG images are allowed");
    return false;
  }
  return true;
}

// Mixed: if it's an image, must be JPEG/PNG; non-image files pass through.
export function validateImageIfImage(file: File): boolean {
  if (file.type.startsWith("image/") && !isAcceptedImage(file)) {
    toast.error("Image uploads must be JPEG or PNG");
    return false;
  }
  return true;
}
