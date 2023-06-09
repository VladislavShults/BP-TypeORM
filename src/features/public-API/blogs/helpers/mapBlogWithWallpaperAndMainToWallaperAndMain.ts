import {
  BlogDBType,
  ImageDBType,
  WallpaperAndMainViewType,
} from '../types/blogs.types';
import { baseUrl } from '../../../../shared/constants/constants';

export const mapBlogWithWallpaperAndMainToWallpaperAndMain = (
  blog: BlogDBType & { wallpapers: ImageDBType; main: ImageDBType },
): WallpaperAndMainViewType => ({
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
        url: baseUrl + blog.main.url,
        width: blog.main.width,
        height: blog.main.height,
        fileSize: blog.main.fileSize,
      },
});
