import { Op } from 'sequelize';
import {
  Partner as PartnerModel,
  PartnerService as PartnerServiceModel,
  AdminPartner as AdminPartnerModel,
  CarPartner as CarPartnerModel
} from '../../../db/index.js';
import { BaseRepo } from '../../../utils/BaseRepo.js';
import { SubscriptionPlanRepository } from './subscriptionPlan/SubscriptionPlanRepository.js';
import { CarSupportServiceRepository } from './carSupportService/CarSupportServiceRepository.js';
import { Partner } from './Partner.js';
import { CarRepository } from '../../car/CarRepository.js';
import { AdminRepository } from '../../admin/AdminRepository.js';
import { NotFoundError } from '../../../utils/errors.js';
import { PARTNER_NOT_FOUND } from '../../../constants/messages.js';

const buildPartner = (model) => new Partner(
  parseInt(model.id, 10),
  model.name,
  model.logo,
  model.address,
  model.phone,
  model.contactPerson,
  model.region,
  model.subscriptionPlan,
  parseInt(model.organizationId, 10),
  model.description,
  model.coordinates,
  model.services,
  model.admins,
  model.cars
);

export class PartnerRepository extends BaseRepo {
  constructor() {
    super(PartnerModel);
    this.subscriptionPlanRepo = new SubscriptionPlanRepository();
    this.servicesRepo = new CarSupportServiceRepository();
    this.carRepo = new CarRepository();
    this.adminRepo = new AdminRepository();
  }

  async getAll(page = 1, region = '') {
    const options = {};
    if (region) {
      options.where = { region };
    }

    const {
      total, data, limit, offset
    } = await super.getAll(page, ['name'], options);

    const collection = await Promise.all(
      data.map(async (entity) => this.constructPartnerProps(entity))
    );

    return {
      total, data: collection, limit, offset
    };
  }

  async getAllByAdmin(page, id) {
    const listOfPartnerIds = (await AdminPartnerModel.findAll({
      where: {
        adminId: id
      }
    })).map((entity) => entity.partnerId);

    return this.getAllByIds(page, listOfPartnerIds);
  }

  async getAllByIds(page, listOfIds) {
    const options = {
      where: {
        id: {
          [Op.in]: listOfIds
        }
      }
    };

    const { data } = await super.getAll(page, ['name'], options);

    const result = await Promise.all(
      data.map(async (entity) => this.constructPartnerProps(entity))
    );

    return result;
  }

  async getOne(id) {
    const entity = await super.getOne(id);
    if (!entity) {
      throw new NotFoundError(PARTNER_NOT_FOUND);
    }
    return this.constructPartnerProps(entity);
  }

  async getAllByOrganizationIds(listOfIds) {
    const collection = await this.dbClient.findAll({
      where: {
        organizationId: {
          [Op.in]: listOfIds
        }
      }
    });

    const result = await Promise.all(collection.map(
      async (entity) => this.constructPartnerProps(entity)
    ));
    return result;
  }

  async constructPartnerProps(entity) {
    const partner = entity;

    partner.subscriptionPlan = await this.subscriptionPlanRepo.getOne(
      partner.subscriptionPlanId
    );

    const servicesIds = (
      await PartnerServiceModel.findAll({
        where: {
          partnerId: partner.id
        }
      })
    ).map((serviceEntity) => serviceEntity.carSupportServiceId);

    partner.services = await this.servicesRepo.getAllByIds(
      servicesIds
    );
    const adminsIds = (
      await AdminPartnerModel.findAll({
        where: {
          partnerId: partner.id
        }
      })
    ).map((serviceEntity) => serviceEntity.adminId);

    partner.admins = await this.adminRepo.getAllByIds(adminsIds);

    const carsIds = (
      await CarPartnerModel.findAll({
        where: {
          partnerId: partner.id
        }
      })
    ).map((carEntity) => carEntity.carId);

    partner.cars = await this.carRepo.getAllByIds(carsIds);

    return buildPartner(partner);
  }

  async create({
    name, logo, description, address, coordinates, phone, contactPerson,
    region, subscriptionPlanId, organizationId, admins,
    services
  }) {
    const partner = await super.create({
      name,
      logo,
      description,
      address,
      coordinates,
      phone,
      contactPerson,
      region,
      subscriptionPlanId,
      organizationId
    });

    await Promise.all(admins.map(async (adminId) => {
      await AdminPartnerModel.create({
        adminId,
        partnerId: partner.id
      });
    }));

    await Promise.all(services.map(async (carSupportServiceId) => {
      await PartnerServiceModel.create({
        carSupportServiceId,
        partnerId: partner.id
      });
    }));

    return this.getOne(partner.id);
  }

  async update(id, updatedData) {
    const partnerProps = Object.keys(updatedData)
      .filter((key) => !['services', 'admins', 'cars'].includes(key))
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = updatedData[key];
        return propObj;
      }, {});

    await super.update(id, partnerProps);

    if (updatedData.services) {
      await PartnerServiceModel.destroy({
        where: {
          partnerId: id
        }
      });

      await Promise.all(updatedData.services.map(async (carSupportServiceId) => {
        await PartnerServiceModel.create({
          partnerId: id,
          carSupportServiceId
        });
      }));
    }

    if (updatedData.admins) {
      await AdminPartnerModel.destroy({
        where: {
          partnerId: id
        }
      });

      await Promise.all(updatedData.admins.map(async (adminId) => {
        await AdminPartnerModel.create({
          partnerId: id,
          adminId
        });
      }));
    }

    if (updatedData.cars) {
      await CarPartnerModel.destroy({
        where: {
          partnerId: id
        }
      });

      await Promise.all(updatedData.cars.map(async (carId) => {
        await CarPartnerModel.create({
          partnerId: id,
          carId
        });
      }));
    }
  }
}
