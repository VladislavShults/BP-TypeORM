import { PostMainImage } from '../entities/post-main-image.entity';
import { ImageViewType } from '../../blogs/types/blogs.types';
import { baseUrl } from '../../../../shared/constants/constants';

export const mapPostMainImageDbToView = (
  postMainImage: PostMainImage,
): ImageViewType => ({
  url: baseUrl + postMainImage.url,
  width: postMainImage.width,
  height: postMainImage.height,
  fileSize: postMainImage.fileSize,
});
