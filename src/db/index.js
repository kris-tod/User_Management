import { genSalt, hash as _hash } from 'bcrypt';
import { DataTypes, Sequelize } from 'sequelize';
import { dbConfig, saltRounds } from '../config/index.js';

import UserModel from './user.js';
import FriendshipModel from './friendships.js';
import TokenBlacklistModel from './tokenBlacklist.js';
import CarModel from './car.js';
import TireModel from './tire.js';
import UserCarModel from './userCar.js';
import AdminModel from './admin.js';

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig.options
);

sequelize.authenticate().then(() => {
  // console.log(CONNECTED_TO_DB);
});

const db = {
  TokenBlacklist: TokenBlacklistModel(sequelize),
  User: UserModel(sequelize),
  Admin: AdminModel(sequelize),
  Friendship: FriendshipModel(sequelize),
  Car: CarModel(sequelize),
  Tire: TireModel(sequelize),
  UserCar: UserCarModel(sequelize)
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
db.Car.hasMany(db.Tire);
db.Tire.belongsTo(db.Car);
db.User.belongsToMany(db.Car, { through: db.UserCar });
db.Car.belongsToMany(db.User, { through: db.UserCar });

sequelize
  .sync({ force: false, alter: false })
  .then(() => db.Admin.findOne({ where: { username: 'admin' } }))
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
          db.Admin.create({
            username: 'admin',
            password: hash,
            email: 'admin@admin.com',
            role: 'superadmin'
          });
        });
      });
    }
  });

export const { Friendship } = db;
export const { User } = db;
export const { TokenBlacklist } = db;
export const { Car, Tire } = db;
export const { UserCar } = db;
export const { Admin } = db;
