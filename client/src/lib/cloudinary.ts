const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

/**
 * Upload a single File to Cloudinary (unsigned).
 * Returns the secure URL of the uploaded image.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'utravel/reviews');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Không thể tải ảnh lên Cloudinary');
  }

  const data = await res.json();
  return data.secure_url as string;
}

/**
 * Upload multiple files, returns array of secure URLs.
 */
export async function uploadImagesToCloudinary(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadImageToCloudinary));
}
