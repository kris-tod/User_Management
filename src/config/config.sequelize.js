import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    host: process.env.DB_HOST,
    port: 5432,
    dialect: 'postgres'
  }
};

export default dbConfig;
