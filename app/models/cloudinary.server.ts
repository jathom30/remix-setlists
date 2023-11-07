// writeAsyncIterableToWritable is a Node-only utility
import { writeAsyncIterableToWritable } from "@remix-run/node";
import type { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const folder = "band-avatar";

export async function uploadImage(
  data: AsyncIterable<Uint8Array>,
  bandId: string,
) {
  const uploadPromise = new Promise<UploadApiResponse>(
    async (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: { width: 400, quality: "auto" },
          use_filename: true,
          unique_filename: false,
          filename_override: bandId,
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          if (!result) {
            return;
          }
          resolve(result);
        },
      );
      await writeAsyncIterableToWritable(data, uploadStream);
    },
  );

  return uploadPromise;
}

export async function deleteImage(bandId: string) {
  return cloudinary.uploader.destroy(`${folder}/${bandId}`, (error, result) => {
    if (error) {
      console.error(error);
    }
  });
}
