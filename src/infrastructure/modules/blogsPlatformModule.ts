import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsController } from '../../features/public-API/blogs/api/blogs.controller';
import { BlogsService } from '../../features/public-API/blogs/application/blogs.service';
import { BlogsRepository } from '../../features/public-API/blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from '../../features/public-API/blogs/api/blogs.query.repository';
import { PostsController } from '../../features/public-API/posts/api/posts.controller';
import { PostsService } from '../../features/public-API/posts/application/posts.service';
import { PostsRepository } from '../../features/public-API/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from '../../features/public-API/posts/api/posts.query.repository';
import { CommentsService } from '../../features/public-API/comments/application/comments.service';
import { CommentsRepository } from '../../features/public-API/comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from '../../features/public-API/comments/api/comments.query.repository';
import { CommentsController } from '../../features/public-API/comments/api/comments.controller';
import { TestingController } from '../../features/public-API/testing/testing.controller';
import { UsersService } from '../../features/SA-API/users/application/users.servive';
import { UsersRepository } from '../../features/SA-API/users/infrastructure/users.repository';
import { UsersQueryRepository } from '../../features/SA-API/users/api/users.query.repository';
import { UsersController } from '../../features/SA-API/users/api/users.controller';
import { AuthController } from '../../features/public-API/auth/api/auth.controller';
import { JwtService } from '../JWT-utility/jwt-service';
import { AuthService } from '../../features/public-API/auth/application/auth.service';
import { EmailService } from '../SMTP-adapter/email-service';
import { EmailManager } from '../SMTP-adapter/email-manager';
import { EmailAdapter } from '../SMTP-adapter/email-adapter';
import { LikesService } from '../../features/public-API/likes/application/likes.service';
import { LikesRepository } from '../../features/public-API/likes/infrastructure/likes.repository';
import { BlogIdValidation } from '../../features/public-API/blogs/validation/blogId-validation';
import { SecurityController } from '../../features/public-API/devices/api/devices.controller';
import { DevicesService } from '../../features/public-API/devices/application/devices.service';
import { DevicesQueryRepository } from '../../features/public-API/devices/api/devices.query.repository';
import { BloggersBlogsController } from '../../features/bloggers-API/blogs/api/bloggers.blogs.controller';
import { AdminBlogsController } from '../../features/SA-API/blogs/api/admin.blogs.controller';
import { AdminBlogsQueryRepository } from '../../features/SA-API/blogs/api/admin.blogs.query.repository';
import { BloggerUsersController } from '../../features/bloggers-API/users/api/blogger.users.controller';
import { DeviceRepository } from '../../features/public-API/devices/infrastructure/devices.repository';
import { UserHttpModule } from '../../features/SA-API/users/module/users-http.module';
import { UsersModule } from '../../features/SA-API/users/module/users.module';
import { IpRestrictionModule } from '../../features/ip-restriction/module/ip-restriction.module';
import { IpRestrictionHttpModule } from '../../features/ip-restriction/module/ip-restriction-http.module';
import { DeviceSessionModule } from '../../features/public-API/devices/module/device-session.module';
import { DeviceSessionHttpModule } from '../../features/public-API/devices/module/device-session-http.module';
import { BlogsModule } from '../../features/public-API/blogs/module/blog.module';
import { BlogHttpModule } from '../../features/public-API/blogs/module/blog-http.module';
import { PostsModule } from '../../features/public-API/posts/module/post.module';
import { PostHttpModule } from '../../features/public-API/posts/module/post-http.module';
import { PostsLikesOrDislikeModule } from '../../features/public-API/likes/module/postsLikesOrDislike.module';
import { PostsLikesOrDislikesHttpModule } from '../../features/public-API/likes/module/postsLikesOrDislikes-http.module';
import { CommentHttpModule } from '../../features/public-API/comments/module/comment-http.module';
import { CommentsModule } from '../../features/public-API/comments/module/comment.module';
import { CommentsLikesOrDislikeModule } from '../../features/public-API/likes/module/commentsLikesOrDislike.module';
import { CommentsLikesOrDislikesHttpModule } from '../../features/public-API/likes/module/commentsLikesOrDislikes-http.module';
import { BannedUsersForBlogModule } from '../../features/bloggers-API/users/module/bannedUsersForBlog.module';
import { BannedUsersForBlogHttpModule } from '../../features/bloggers-API/users/module/bannedUsersForBlog-http.module';
import { AdminQuizGameController } from '../../features/SA-API/quiz-game/api/admin.quiz.controller';
import { QuizGameQuestionModule } from '../../features/SA-API/quiz-game/module/quizGameQuestion.module';
import { QuizGameQuestionHttpModule } from '../../features/SA-API/quiz-game/module/quizGameQuestion-http.module';
import { QuizGameRepository } from '../../features/SA-API/quiz-game/infrastructure/quizGame.repository';
import { CreateQuestionUseCase } from '../../features/SA-API/quiz-game/application/use-cases/create-question-use-case';
import { QuizQueryRepository } from '../../features/SA-API/quiz-game/api/quiz-query-repository';
import { DeleteQuestionByIdUseCase } from '../../features/SA-API/quiz-game/application/use-cases/delete-question-by-id-use-case';
import { UpdateQuestionByIdUseCase } from '../../features/SA-API/quiz-game/application/use-cases/update-question-by-id-use-case';
import { UpdatePublishedQuestionByIdUseCase } from '../../features/SA-API/quiz-game/application/use-cases/update-published-question-use-case';
import { ConnectionUseCase } from '../../features/public-API/quiz-game/application/use-cases/connection.use-case';
import { QuizController } from '../../features/public-API/quiz-game/api/quiz.controller/quiz.controller';
import { QuizGameModule } from '../../features/public-API/quiz-game/module/quiz-game.module';
import { QuizGameHttpModule } from '../../features/public-API/quiz-game/module/quiz-game.http-module';
import { GiveAnAnswerUseCase } from '../../features/public-API/quiz-game/application/use-cases/give-an-answer.use-case';
import { AnswerModule } from '../../features/public-API/quiz-game/module/answer.module';
import { AnswerHttpModule } from '../../features/public-API/quiz-game/module/answer-http.module';
import { FinishedGameAboutTenSecUseCase } from '../../features/public-API/quiz-game/application/use-cases/finished-game-about-ten-sec.use-case';
import { UploadService } from '../../features/public-API/upload/application/upload.service';
import { UploadFileAndSaveInfoInDbUseCase } from '../../features/public-API/blogs/application/use-cases/upload - file-and-save-info-in-db';

export const CommandHandler = [
  CreateQuestionUseCase,
  DeleteQuestionByIdUseCase,
  UpdateQuestionByIdUseCase,
  UpdatePublishedQuestionByIdUseCase,
  ConnectionUseCase,
  GiveAnAnswerUseCase,
  FinishedGameAboutTenSecUseCase,
  UploadFileAndSaveInfoInDbUseCase,
];

@Module({
  imports: [
    CqrsModule,
    UserHttpModule,
    UsersModule,
    IpRestrictionModule,
    IpRestrictionHttpModule,
    DeviceSessionModule,
    DeviceSessionHttpModule,
    BlogsModule,
    BlogHttpModule,
    PostsModule,
    PostHttpModule,
    PostsLikesOrDislikeModule,
    PostsLikesOrDislikesHttpModule,
    CommentsModule,
    CommentHttpModule,
    CommentsLikesOrDislikeModule,
    CommentsLikesOrDislikesHttpModule,
    BannedUsersForBlogModule,
    BannedUsersForBlogHttpModule,
    QuizGameQuestionModule,
    QuizGameQuestionHttpModule,
    QuizGameModule,
    QuizGameHttpModule,
    AnswerModule,
    AnswerHttpModule,
  ],
  controllers: [
    BlogsController,
    BloggersBlogsController,
    AdminBlogsController,
    PostsController,
    CommentsController,
    UsersController,
    BloggerUsersController,
    TestingController,
    AuthController,
    SecurityController,
    AdminQuizGameController,
    QuizController,
  ],
  providers: [
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    AdminBlogsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    AuthService,
    JwtService,
    EmailService,
    EmailManager,
    EmailAdapter,
    LikesService,
    LikesRepository,
    BlogIdValidation,
    DevicesService,
    DeviceRepository,
    DevicesQueryRepository,
    QuizGameRepository,
    QuizQueryRepository,
    UploadService,
    ...CommandHandler,
  ],
})
export class BlogsPlatformModule {}
