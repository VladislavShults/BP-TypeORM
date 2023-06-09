import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Adapter {
  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
      region: process.env.S3_REGION,
      endpoint: process.env.BASE_URL,
    });
  }

  async uploadImage(
    filename: string,
    buffer: Buffer,
    id: number,
    folder: string,
  ) {
    const key = `${folder}/${id}/${filename}`;

    const output = await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.BACKET_NAME,
        Key: key,
        Body: buffer,
      }),
    );

    return { url: key, id: output.ETag };
  }
}
