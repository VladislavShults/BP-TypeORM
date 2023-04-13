import { User } from '../features/SA-API/users/entities/user.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';

console.log('dirname', __dirname);
export const pgConnectionOptions: PostgresConnectionOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL2,
  port: 5432,
  synchronize: false,
  entities: [User],
  migrations: [__dirname + '/postgres/migrations/**/*{.ts,.js}'],
};

export default new DataSource(pgConnectionOptions);
