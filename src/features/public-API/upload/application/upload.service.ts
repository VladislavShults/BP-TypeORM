import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  private s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: 'YCAJES2-iK2fGC-Nsrz-w1Ver',
        secretAccessKey: 'YCMZwT7Y5Nm-CqUZQpF-7vtS6uFkUhQE0gz0CQid',
      },
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
    });
  }

  async uploadImage(filename: string, buffer: Buffer, blogId: string) {
    const key = `wallpapers/${blogId}/${filename}`;

    const output = await this.s3.send(
      new PutObjectCommand({
        Bucket: 'shvs1510',
        Key: key,
        Body: buffer,
      }),
    );

    return { url: key, id: output.ETag };
  }
}
