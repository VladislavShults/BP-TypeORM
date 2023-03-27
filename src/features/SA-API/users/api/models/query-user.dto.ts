export class QueryUserDto {
  banStatus: 'all' | 'banned' | 'notBanned';
  pageNumber: string;
  pageSize: string;
  sortBy: string;
  sortDirection: 'DESC' | 'ASC';
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
}
