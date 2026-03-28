import { v2 as cloudinary } from 'cloudinary';

const isConfigured = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export function isCloudinaryEnabled() {
  return isConfigured;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder: string; publicId?: string; transformation?: object }
): Promise<{ url: string; publicId: string; width?: number; height?: number }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `tripsync/${options.folder}`,
        public_id: options.publicId,
        resource_type: 'auto',
        ...(options.transformation ? { transformation: options.transformation } : {}),
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

export function getCloudinaryUrl(publicId: string, options?: { width?: number; height?: number; crop?: string }) {
  if (!options) return cloudinary.url(publicId);
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        quality: 'auto',
        format: 'auto',
      },
    ],
  });
}

export async function deleteFromCloudinary(publicId: string) {
  if (!isConfigured) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[Cloudinary] Delete failed:', error);
  }
}
