import { ViewBlogByIdType } from '../types/blogs.types';
import { baseUrl } from '../../../../shared/constants/constants';

export const mapBlogById = (blog): ViewBlogByIdType => ({
  id: blog.id.toString(),
  name: blog.blogName,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
  images: {
    wallpaper: !blog.wallpapers
      ? null
      : {
          url: baseUrl + blog.wallpapers.url,
          width: blog.wallpapers.width,
          height: blog.wallpapers.height,
          fileSize: blog.wallpapers.fileSize,
        },
    main: !blog.main
      ? null
      : {
          url: baseUrl + blog.wallpapers.url,
          width: blog.main.width,
          height: blog.main.height,
          fileSize: blog.main.fileSize,
        },
  },
});

export const mapBlogByIdWithUserId = (
  blog,
): ViewBlogByIdType & { userId: string } => ({
  id: blog.id.toString(),
  name: blog.blogName,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  userId: blog.userId.toString(),
  isMembership: blog.isMembership,
  images: {
    wallpaper: !blog.wallpapers
      ? null
      : {
          url: baseUrl + blog.wallpapers.url,
          width: blog.wallpapers.width,
          height: blog.wallpapers.height,
          fileSize: blog.wallpapers.fileSize,
        },
    main: !blog.main
      ? null
      : {
          url: baseUrl + blog.wallpapers.url,
          width: blog.main.width,
          height: blog.main.height,
          fileSize: blog.main.fileSize,
        },
  },
});
