import { genSalt, hash as _hash } from 'bcrypt';
import { Sequelize } from 'sequelize';
import { dbConfig, saltRounds } from '../../config/index.js';

import UserModel from './user.js';
import FriendshipModel from './friendships.js';
import TokenBlacklistModel from './tokenBlacklist.js';

import { CONNECTED_TO_DB, SYNC_WITH_DB } from '../../constants/messages.js';

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig.options
);

sequelize
  .authenticate()
  .then(() => {
    console.log(CONNECTED_TO_DB);
  })
  .catch((err) => {
    console.log('Error: ', err);
  });

const db = {
  TokenBlacklist: TokenBlacklistModel(sequelize),
  User: UserModel(sequelize),
  Friendship: FriendshipModel(sequelize)
};

sequelize
  .sync({ force: false })
  .then(() => {
    console.log(SYNC_WITH_DB);
    return db.User.findOne({ where: { username: 'admin' } });
  })
  .then((data) => {
    if (!data) {
      genSalt(saltRounds, (err, salt) => {
        if (err) {
          console.log(err);
          return;
        }
        _hash(process.env.ADMIN_PASSWORD, salt, (hashError, hash) => {
          if (hashError) {
            console.log(hashError);
            return;
          }
          db.User.create({
            username: 'admin',
            password: hash,
            email: 'admin@admin.com',
            role: 0
          }).catch((createError) => {
            console.log(createError);
          });
        });
      });
    }
  })
  .catch((err) => {
    console.log(err);
  });

export const { Friendship } = db;
export const { User } = db;
export const { TokenBlacklist } = db;