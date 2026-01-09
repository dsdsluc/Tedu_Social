import cloudinary from "@core/config/cloudinary.config";

export interface UploadResult {
  url: string;
  publicId: string;
}

export default class UploadService {
  public async uploadSingle(
    file: Express.Multer.File,
    folder = "posts"
  ): Promise<UploadResult> {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  public async uploadMultiple(
    files: Express.Multer.File[],
    folder = "posts"
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: "image",
      });

      results.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    return results;
  }
}
