import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  @Delete('all-data')
  @HttpCode(204)
  async clearAllData(): Promise<HttpStatus> {
    await this.dataSource.query(
      `DELETE FROM public."quiz_game_questions_quiz_game_question"`,
    );
    await this.dataSource.query(`DELETE FROM public."quiz_game_question"`);
    await this.dataSource.query(`DELETE FROM public."answers"`);
    await this.dataSource.query(`DELETE FROM public."quiz_game"`);
    await this.dataSource.query(`DELETE FROM public."ban_info"`);
    await this.dataSource.query(`DELETE FROM public."email_confirmation"`);
    await this.dataSource.query(`DELETE FROM public."device_session"`);
    await this.dataSource.query(
      `DELETE FROM public."comments_likes_or_dislike"`,
    );
    await this.dataSource.query(`DELETE FROM public."posts_likes_or_dislike"`);
    await this.dataSource.query(`DELETE FROM public."comment"`);
    await this.dataSource.query(`DELETE FROM public."post"`);
    await this.dataSource.query(`DELETE FROM public."banned_users_for_blog"`);
    await this.dataSource.query(`DELETE FROM public."blog"`);
    await this.dataSource.query(`DELETE FROM public."user"`);

    return;
  }
}
