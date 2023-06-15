import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { S3Adapter } from '../../../upload/application/s3-adapter';
import sharp from 'sharp';
import { PostMainImage } from '../../entities/post-main-image.entity';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export class UploadPostMainImageAndSaveInfoInDbCommand {
  constructor(
    public filename: string,
    public buffer: Buffer,
    public postId: number,
  ) {}
}
@CommandHandler(UploadPostMainImageAndSaveInfoInDbCommand)
export class UploadPostMainImageAndSaveInfoInDbUseCase
  implements ICommandHandler<UploadPostMainImageAndSaveInfoInDbCommand>
{
  constructor(
    private myDataSource: DataSource,
    private uploadService: S3Adapter,
  ) {}

  async execute(
    command: UploadPostMainImageAndSaveInfoInDbCommand,
  ): Promise<any> {
    await this.myDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const metadata = await sharp(command.buffer).metadata();

        const height = metadata.height;
        const width = metadata.width;
        const fileSize = command.buffer.length;

        if (height !== 432 || width !== 940) throw new BadRequestException();

        const bufferMedSize = await sharp(command.buffer)
          .resize(300, 180)
          .toBuffer();
        const bufferSmallSize = await sharp(command.buffer)
          .resize(149, 96)
          .toBuffer();

        const folderOriginSize = 'posts/mainImage/origin';
        const folderMedSize = 'posts/mainImage/medium';
        const folderSmallSize = 'posts/mainImage/small';

        const saveAndGetInfoAboutOriginImage =
          await this.uploadService.uploadImage(
            command.filename,
            command.buffer,
            command.postId,
            folderOriginSize,
          );

        const saveAndGetInfoAboutMedImage =
          await this.uploadService.uploadImage(
            command.filename,
            bufferMedSize,
            command.postId,
            folderMedSize,
          );

        const saveAndGetInfoAboutSmallImage =
          await this.uploadService.uploadImage(
            command.filename,
            bufferSmallSize,
            command.postId,
            folderSmallSize,
          );

        const newMainOriginImage = new PostMainImage(
          randomUUID(),
          saveAndGetInfoAboutOriginImage.url,
          width,
          height,
          fileSize,
          Number(command.postId),
          new Date(),
        );
        const newMainMedImage = new PostMainImage(
          randomUUID(),
          saveAndGetInfoAboutMedImage.url,
          300,
          180,
          bufferMedSize.length,
          Number(command.postId),
          new Date(),
        );
        const newMainSmallImage = new PostMainImage(
          randomUUID(),
          saveAndGetInfoAboutSmallImage.url,
          149,
          96,
          bufferSmallSize.length,
          Number(command.postId),
          new Date(),
        );

        await transactionalEntityManager.save([
          newMainOriginImage,
          newMainMedImage,
          newMainSmallImage,
        ]);
      },
    );
  }
}
