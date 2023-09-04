export const port = process.env.PORT;
export const domain = `http://localhost:${process.env.PORT}`;
export const staticDirname = 'uploads';
export const dirname = '/Users/appstreams/Documents/User_Management';
export const dbConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  options: {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
};
export const secret = process.env.SECRET;
export const authCookieName = 'x-auth-token';
export const saltRounds = 10;
