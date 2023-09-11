import { genSalt, hash as _hash } from 'bcrypt';
import { DataTypes, Sequelize } from 'sequelize';
import { dbConfig, saltRounds } from '../config/index.js';

import UserModel from './user.js';
import FriendshipModel from './friendships.js';
import TokenBlacklistModel from './tokenBlacklist.js';

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig.options
);

sequelize
  .authenticate()
  .then(() => {
    // console.log(CONNECTED_TO_DB);
  });

const db = {
  TokenBlacklist: TokenBlacklistModel(sequelize),
  User: UserModel(sequelize),
  Friendship: FriendshipModel(sequelize)
};

db.Friendship.hasOne(db.User, {
  foreinKey: {
    name: 'user_id',
    type: DataTypes.BIGINT,
    allowNull: false
  }
});
db.Friendship.hasOne(db.User, {
  foreinKey: {
    name: 'friend_id',
    type: DataTypes.BIGINT,
    allowNull: false
  }
});
db.User.belongsTo(db.Friendship);

sequelize
  .sync({ force: false, alter: true })
  .then(() => db.User.findOne({ where: { username: 'admin' } }))
  .then((data) => {
    if (!data) {
      genSalt(saltRounds, (err, salt) => {
        if (err) {
          // console.log(err);
          return;
        }
        _hash(process.env.ADMIN_PASSWORD, salt, (hashError, hash) => {
          if (hashError) {
            return;
          }
          db.User.create({
            username: 'admin',
            password: hash,
            email: 'admin@admin.com',
            role: 'admin'
          });
        });
      });
    }
  });

export const { Friendship } = db;
export const { User } = db;
export const { TokenBlacklist } = db;
