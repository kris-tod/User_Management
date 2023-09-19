import { genSalt, hash as _hash } from 'bcrypt';
import { Sequelize } from 'sequelize';
import { dbConfig, saltRounds } from '../config/index.js';

import UserModel from './user.js';
import FriendshipModel from './friendships.js';
import TokenBlacklistModel from './tokenBlacklist.js';
import CarModel from './car.js';
import TireModel from './tire.js';
import UserCarModel from './userCar.js';
import AdminModel from './admin.js';
import CarSupportServiceModel from './carSupportService.js';
import SubscriptionPlanModel from './subscriptionPlan.js';
import PartnerModel from './partner.js';
import AdminPartnerModel from './adminPartner.js';
import OrganizationModel from './organization.js';
import CarPartnerModel from './carPartner.js';
import UserPartnerModel from './userPartner.js';
import PartnerServiceModel from './partnerService.js';
import RegionModel from './region.js';

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
  UserCar: UserCarModel(sequelize),
  CarSupportService: CarSupportServiceModel(sequelize),
  SubscriptionPlan: SubscriptionPlanModel(sequelize),
  Partner: PartnerModel(sequelize),
  AdminPartner: AdminPartnerModel(sequelize),
  Organization: OrganizationModel(sequelize),
  CarPartner: CarPartnerModel(sequelize),
  UserPartner: UserPartnerModel(sequelize),
  PartnerService: PartnerServiceModel(sequelize),
  Region: RegionModel(sequelize)
};

db.Car.hasMany(db.Tire);
db.Tire.belongsTo(db.Car);
db.User.belongsToMany(db.Car, { through: db.UserCar, onDelete: 'CASCADE' });
db.Car.belongsToMany(db.User, { through: db.UserCar, onDelete: 'CASCADE' });

db.Partner.belongsToMany(db.CarSupportService, { through: db.PartnerService, onDelete: 'CASCADE' });
db.CarSupportService.belongsToMany(db.Partner, { through: db.PartnerService, onDelete: 'CASCADE' });

db.SubscriptionPlan.hasMany(db.Partner, { onDelete: 'RESTRICT' });
db.Partner.belongsTo(db.SubscriptionPlan);

db.Partner.belongsToMany(db.Admin, { through: db.AdminPartner, onDelete: 'CASCADE' });
db.Admin.belongsToMany(db.Partner, { through: db.AdminPartner, onDelete: 'CASCADE' });

db.Car.belongsToMany(db.Partner, { through: db.CarPartner, onDelete: 'CASCADE' });
db.Partner.belongsToMany(db.Car, { through: db.CarPartner, onDelete: 'CASCADE' });

db.Organization.hasMany(db.Partner);
db.Partner.belongsTo(db.Organization);

db.User.belongsToMany(db.Partner, { through: db.UserPartner, onDelete: 'CASCADE' });
db.Partner.belongsToMany(db.User, { through: db.UserPartner, onDelete: 'CASCADE' });

db.Region.hasMany(db.Admin, { onDelete: 'RESTRICT' });
db.Admin.belongsTo(db.Region);

db.Region.hasMany(db.User, { onDelete: 'RESTRICT' });
db.User.belongsTo(db.Region);

db.Region.hasMany(db.Partner, { onDelete: 'RESTRICT' });
db.Partner.belongsTo(db.Region);

db.Region.hasMany(db.CarSupportService, { onDelete: 'RESTRICT' });
db.CarSupportService.belongsTo(db.Region);

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
export const {
  CarSupportService,
  Partner,
  SubscriptionPlan,
  Organization,
  CarPartner,
  AdminPartner,
  UserPartner,
  PartnerService,
  Region
} = db;
