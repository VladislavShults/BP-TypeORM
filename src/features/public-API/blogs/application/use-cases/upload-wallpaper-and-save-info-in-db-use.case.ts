import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { S3Adapter } from '../../../upload/application/s3-adapter';
import sharp from 'sharp';
import { Wallpaper } from '../../entities/wallpaper.entity';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export class UploadWallpaperImageAndSaveInfoInDbCommand {
  constructor(
    public filename: string,
    public buffer: Buffer,
    public blogId: string,
  ) {}
}

@CommandHandler(UploadWallpaperImageAndSaveInfoInDbCommand)
export class UploadWallpaperAndSaveInfoInDbUseCase
  implements ICommandHandler<UploadWallpaperImageAndSaveInfoInDbCommand>
{
  constructor(
    private myDataSource: DataSource,
    private uploadService: S3Adapter,
  ) {}

  async execute(
    command: UploadWallpaperImageAndSaveInfoInDbCommand,
  ): Promise<any> {
    await this.myDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const metadata = await sharp(command.buffer).metadata();

        const height = metadata.height;
        const width = metadata.width;
        const fileSize = command.buffer.length;

        if (height !== 312 || width !== 1028) throw new BadRequestException();

        const folder = 'blogs/wallpapers';

        const saveAndGetInfoAboutImage = await this.uploadService.uploadImage(
          command.filename,
          command.buffer,
          Number(command.blogId),
          folder,
        );

        const newWallpaper = new Wallpaper();

        newWallpaper.id = randomUUID();
        newWallpaper.url = saveAndGetInfoAboutImage.url;
        newWallpaper.width = width;
        newWallpaper.height = height;
        newWallpaper.fileSize = fileSize;
        newWallpaper.blogId = Number(command.blogId);
        newWallpaper.createdAt = new Date();

        await transactionalEntityManager.save(newWallpaper);
      },
    );
  }
}
