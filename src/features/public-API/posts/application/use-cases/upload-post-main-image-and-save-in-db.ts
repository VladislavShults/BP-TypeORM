import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { S3Adapter } from '../../../upload/application/s3-adapter';
import sharp from 'sharp';
import { PostMainImage } from '../../entities/post-main-image.entity';

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

        const folder = 'posts/mainImage';

        const saveAndGetInfoAboutImage = await this.uploadService.uploadImage(
          command.filename,
          command.buffer,
          command.postId,
          folder,
        );

        const newMainImage = new PostMainImage();

        newMainImage.id = saveAndGetInfoAboutImage.id.slice(1, -1);
        newMainImage.url = saveAndGetInfoAboutImage.url;
        newMainImage.width = width;
        newMainImage.height = height;
        newMainImage.fileSize = fileSize;
        newMainImage.postId = Number(command.postId);
        newMainImage.createdAt = new Date();

        await transactionalEntityManager.save(newMainImage);
      },
    );
  }
}
