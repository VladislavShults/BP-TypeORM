import * as dotenv from 'dotenv';

dotenv.config();

export const baseUrl =
  process.env.BASE_URL + '/' + process.env.BACKET_NAME + '/';
