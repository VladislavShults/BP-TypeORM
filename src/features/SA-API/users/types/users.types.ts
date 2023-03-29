export type UserDBType = {
  id: number;
  login: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
};

export type ViewUserType = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: {
    isBanned: boolean;
    banDate: Date;
    banReason: string;
  };
};

export type ViewUsersTypeWithPagination = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewUserType[];
};

export type EmailConfirmationType = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
  userId: string;
};

export type UserForTypeOrmType = {
  login: string;
  email: string;
  createdAt: Date;
  passwordHash: string;
};

export type UserSQLType = {
  UserId: number;
  Login: string;
  Email: string;
  CreatedAt: Date;
  PasswordHash: string;
};

export type UsersJoinBanInfoType = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo: { isBanned: boolean; banReason: string; banDate: Date };
};

export type UsersJoinEmailConfirmationType = {
  id: number;
  login: string;
  email: string;
  emailConfirmation: {
    isConfirmed: boolean;
    confirmationCode: string;
    expirationDate: Date;
  };
};

export type UsersForCheckInDB = {
  userId: number;
  login: string;
  email: string;
  passwordHash: string;
  isBanned: boolean;
};
