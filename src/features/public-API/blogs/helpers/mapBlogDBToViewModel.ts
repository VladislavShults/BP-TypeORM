import {
  BlogDBType,
  ImageDBType,
  ImageViewType,
  ViewBlogType,
} from '../types/blogs.types';

export const mapBlog = (
  blog: BlogDBType & { wallpapers: ImageViewType; main: ImageDBType },
): ViewBlogType => ({
  id: blog.id.toString(),
  name: blog.blogName,
  description: blog.description,
  websiteUrl: blog.websiteUrl,
  createdAt: blog.createdAt,
  isMembership: blog.isMembership,
});
