import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { UploadService } from '../../../upload/application/upload.service';
import sharp from 'sharp';
import { Wallpaper } from '../../entities/wallpaper.entity';

export class UploadFileAndSaveInfoInDbCommand {
  constructor(
    public filename: string,
    public buffer: Buffer,
    public blogId: string,
  ) {}
}

@CommandHandler(UploadFileAndSaveInfoInDbCommand)
export class UploadFileAndSaveInfoInDbUseCase
  implements ICommandHandler<UploadFileAndSaveInfoInDbCommand>
{
  constructor(
    private myDataSource: DataSource,
    private uploadService: UploadService,
  ) {}

  async execute(command: UploadFileAndSaveInfoInDbCommand): Promise<any> {
    await this.myDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const metadata = await sharp(command.buffer).metadata();

        const height = metadata.height;
        const width = metadata.width;
        const fileSize = command.buffer.length;

        const saveAndGetInfoAboutImage = await this.uploadService.uploadImage(
          command.filename,
          command.buffer,
          command.blogId,
        );

        const newWallpaper = new Wallpaper();

        newWallpaper.id = saveAndGetInfoAboutImage.id.slice(1, -1);
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
