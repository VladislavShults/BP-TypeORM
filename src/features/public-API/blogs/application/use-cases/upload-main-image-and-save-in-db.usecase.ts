import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { S3Adapter } from '../../../upload/application/s3-adapter';
import sharp from 'sharp';
import { BlogMainImage } from '../../entities/main-image.entity';
import { BadRequestException } from '@nestjs/common';

export class UploadMainImageAndSaveInfoInDbCommand {
  constructor(
    public filename: string,
    public buffer: Buffer,
    public blogId: string,
  ) {}
}

@CommandHandler(UploadMainImageAndSaveInfoInDbCommand)
export class UploadMainImageAndSaveInfoInDbUseCase
  implements ICommandHandler<UploadMainImageAndSaveInfoInDbCommand>
{
  constructor(
    private myDataSource: DataSource,
    private uploadService: S3Adapter,
  ) {}

  async execute(command: UploadMainImageAndSaveInfoInDbCommand): Promise<any> {
    await this.myDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const metadata = await sharp(command.buffer).metadata();

        const height = metadata.height;
        const width = metadata.width;
        const fileSize = command.buffer.length;

        if (height !== 156 || width !== 156) throw new BadRequestException();

        const folder = 'blogs/mainImage';

        const saveAndGetInfoAboutImage = await this.uploadService.uploadImage(
          command.filename,
          command.buffer,
          Number(command.blogId),
          folder,
        );

        const newMainImage = new BlogMainImage();

        newMainImage.id = saveAndGetInfoAboutImage.id.slice(1, -1);
        newMainImage.url = saveAndGetInfoAboutImage.url;
        newMainImage.width = width;
        newMainImage.height = height;
        newMainImage.fileSize = fileSize;
        newMainImage.blogId = Number(command.blogId);
        newMainImage.createdAt = new Date();

        await transactionalEntityManager.save(newMainImage);
      },
    );
  }
}
