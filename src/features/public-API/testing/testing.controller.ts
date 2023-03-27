import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async clearAllData(): Promise<HttpStatus> {
    await this.dataSource.query(`DELETE FROM public."ban_info"`);
    await this.dataSource.query(`DELETE FROM public."email_confirmation"`);
    // await this.dataSource.query(`DELETE FROM public."DeviceSession"`);
    // await this.dataSource.query(`DELETE FROM public."CommentsLikesOrDislike"`);
    // await this.dataSource.query(`DELETE FROM public."PostsLikesOrDislike"`);
    // await this.dataSource.query(`DELETE FROM public."Comments"`);
    // await this.dataSource.query(`DELETE FROM public."Posts"`);
    // await this.dataSource.query(`DELETE FROM public."BannedUsersForBlog"`);
    // await this.dataSource.query(`DELETE FROM public."Blogs"`);
    await this.dataSource.query(`DELETE FROM public."user"`);

    return;
  }
}
