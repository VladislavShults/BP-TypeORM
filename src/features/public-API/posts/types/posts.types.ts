export type PostDBType = {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: Date;
  userId: string;
  isDeleted: boolean;
  isBanned: boolean;
  newestLikes: NewestLikesType[] | [];
};

export type NewestLikesType = {
  addedAt: Date;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
  newestLikes: NewestLikesType[];
};

export type ViewPostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfoType;
};

export type ViewPostWithoutLikesType = Omit<ViewPostType, 'extendedLikesInfo'>;

export type ViewPostsTypeWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewPostType[];
};
