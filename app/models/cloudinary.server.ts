import { Readable } from "stream";

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
  data: Promise<Uint8Array<ArrayBufferLike>>,
  bandId: string,
) {
  const uploadPromise = new Promise<UploadApiResponse>(
    // eslint-disable-next-line no-async-promise-executor
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
      // Await the promise to get the Uint8Array<ArrayBufferLike>
      const byteArray = await data;

      // Convert Uint8Array to a readable stream
      const readableStream = new Readable();
      readableStream._read = () => {
        throw new Error("_read method not implemented");
      }; // _read is required but you can noop it
      readableStream.push(byteArray);
      readableStream.push(null);

      // Pipe the readable stream to the upload stream
      readableStream.pipe(uploadStream);
    },
  );

  return uploadPromise;
}

export async function deleteImage(bandId: string) {
  return cloudinary.uploader.destroy(`${folder}/${bandId}`, (error) => {
    if (error) {
      console.error(error);
    }
  });
}
