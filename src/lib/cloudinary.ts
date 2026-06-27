import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINSRY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINSRY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.COUDINARY_SECRET_KEY;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Cloudinary credentials are not set in environment variables.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function uploadImage(fileBuffer: Buffer, folder: string, publicId?: string) {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `glamlounge/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }
  try {
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    const pathPart = parts[1];
    
    const segments = pathPart.split('/');
    if (segments[0].startsWith('v')) {
      segments.shift();
    }
    
    const publicIdWithExt = segments.join('/');
    const dotIndex = publicIdWithExt.lastIndexOf('.');
    if (dotIndex !== -1) {
      return publicIdWithExt.substring(0, dotIndex);
    }
    return publicIdWithExt;
  } catch (error) {
    console.error('Failed to parse Cloudinary URL:', error);
    return null;
  }
}

export default cloudinary;
