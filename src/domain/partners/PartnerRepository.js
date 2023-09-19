import { Op } from 'sequelize';
import {
  Partner as PartnerModel,
  PartnerService as PartnerServiceModel,
  AdminPartner as AdminPartnerModel,
  CarPartner as CarPartnerModel,
  Region
} from '../../db/index.js';
import { BaseRepo, MAX_PER_PAGE } from '../../utils/BaseRepo.js';
import { SubscriptionPlanRepository } from '../subscriptionPlan/SubscriptionPlanRepository.js';
import { CarSupportServiceRepository } from '../carSupportService/CarSupportServiceRepository.js';
import { Partner } from './Partner.js';
import { CarRepository } from '../car/CarRepository.js';
import { AdminRepository } from '../admin/AdminRepository.js';
import { NotFoundError } from '../../utils/errors.js';
import { PARTNER_NOT_FOUND, SUBSCRIPTION_PLAN_NOT_FOUND } from '../../constants/messages.js';
import { RegionRepository } from '../region/RegionRepository.js';

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
    this.regionRepo = new RegionRepository();
  }

  buildEntity(model) {
    return new Partner(
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
  }

  async getAll(page = 1, region = '', order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    const options = {};
    if (region) {
      options.where = { region };
    }

    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      include: [Region],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    const collection = await Promise.all(
      rows.map(async (entity) => this.constructPartnerProps(entity))
    );

    return {
      total: count, data: collection, limit: entitiesPerPage, offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByAdmin(page, id, order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    const listOfPartnerIds = (await AdminPartnerModel.findAll({
      where: {
        adminId: id
      }
    })).map((entity) => entity.partnerId);

    const options = {
      where: {
        id: {
          [Op.in]: listOfPartnerIds
        }
      }
    };

    const {
      total, data, limit, offset
    } = await this.dbClient.findAndCountAll({
      order,
      include: [Region],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    const result = await Promise.all(
      data.map(async (entity) => this.constructPartnerProps(entity))
    );

    return {
      total, data: result, limit, offset
    };
  }

  async getAllByIds(page, listOfIds, order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    const options = {
      where: {
        id: {
          [Op.in]: listOfIds
        }
      }
    };

    const {
      rows
    } = await this.dbClient.findAndCountAll({
      order,
      include: [Region],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    const result = await Promise.all(
      rows.map(async (entity) => this.constructPartnerProps(entity))
    );

    return result;
  }

  async getOne(id) {
    const entity = await this.dbClient.findOne({
      include: [Region],
      where: { id }
    });
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

    if (partner.subscriptionPlanId) {
      partner.subscriptionPlan = await this.subscriptionPlanRepo.getOne(
        partner.subscriptionPlanId
      );
    }

    if (entity.regionId) {
      partner.region = await this.regionRepo.getOne(partner.regionId);
    }
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

    return this.buildEntity(partner);
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
      regionId: region,
      subscriptionPlanId,
      organizationId
    });

    await AdminPartnerModel.bulkCreate(admins.map((adminId) => ({
      adminId,
      partnerId: partner.id
    })));

    await PartnerServiceModel.bulkCreate(services.map((carSupportServiceId) => ({
      carSupportServiceId,
      partnerId: partner.id
    })));

    return this.getOne(partner.id);
  }

  async update(id, updatedData) {
    const partnerProps = Object.keys(updatedData)
      .filter((key) => !['subscriptionPlanId', 'services', 'admins', 'cars', 'region'].includes(key))
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = updatedData[key];
        return propObj;
      }, {});

    await super.update(id, partnerProps);

    if (updatedData.region) {
      await super.update(id, { regionId: updatedData.region });
    }

    if (updatedData.subscriptionPlanId) {
      const subscriptionPlan = await this.subscriptionPlanRepo
        .getOne(updatedData.subscriptionPlanId);

      if (!subscriptionPlan) {
        throw new NotFoundError(SUBSCRIPTION_PLAN_NOT_FOUND);
      }

      await super.update(id, { subscriptionPlanId: updatedData.subscriptionPlanId });
    }

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
