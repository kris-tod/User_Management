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
      model.id,
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

  async getAll(page = 1, optionParam = {}, order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    const options = optionParam;
    if (optionParam.region) {
      options.where = { region: optionParam.region };
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
      count, rows
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

    return {
      total: count, data: result, limit: entitiesPerPage, offset: entitiesPerPage * (page - 1)
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

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: [Region],
      ...options
    });
    if (!entity) {
      throw new NotFoundError(PARTNER_NOT_FOUND);
    }
    return this.constructPartnerProps(entity, options);
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

  async getAllOfferingService(page, carSupportServiceId, options = {}, order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    const partnersIds = (await PartnerServiceModel.findAll({
      where: {
        carSupportServiceId
      }
    }, options)).map((entity) => entity.partnerId);

    const partners = await this.getAllByIds(page, partnersIds, order, entitiesPerPage);

    return {
      total: partners.length,
      data: partners,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async constructPartnerProps(entity, options = {}) {
    const partner = entity;

    if (partner.subscriptionPlanId) {
      partner.subscriptionPlan = await this.subscriptionPlanRepo.getOne(
        partner.subscriptionPlanId,
        options
      );
    }

    if (entity.regionId) {
      partner.region = await this.regionRepo.getOne(partner.regionId, options);
    }
    const servicesIds = (
      await PartnerServiceModel.findAll({
        where: {
          partnerId: partner.id
        },
        ...options
      })
    ).map((serviceEntity) => serviceEntity.carSupportServiceId);

    partner.services = await this.servicesRepo.getAllByIds(
      servicesIds,
      options
    );
    const adminsIds = (
      await AdminPartnerModel.findAll({
        where: {
          partnerId: partner.id
        },
        ...options
      })
    ).map((serviceEntity) => serviceEntity.adminId);

    partner.admins = await this.adminRepo.getAllByIds(adminsIds, options);

    const carsIds = (
      await CarPartnerModel.findAll({
        where: {
          partnerId: partner.id
        },
        ...options
      })
    ).map((carEntity) => carEntity.carId);

    partner.cars = await this.carRepo.getAllByIds(carsIds, options);

    return this.buildEntity(partner);
  }

  async create({
    name, logo, description, address, coordinates, phone, contactPerson,
    region, subscriptionPlanId, organizationId, admins,
    services
  }, options = {}) {
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
    }, options);

    await AdminPartnerModel.bulkCreate(admins.map((adminId) => ({
      adminId,
      partnerId: partner.id
    })), options);

    await PartnerServiceModel.bulkCreate(services.map((carSupportServiceId) => ({
      carSupportServiceId,
      partnerId: partner.id
    })), options);

    return this.getOne(partner.id, options);
  }

  async update(id, updatedData, options = {}) {
    const partnerProps = Object.keys(updatedData)
      .filter((key) => !['subscriptionPlanId', 'services', 'admins', 'cars', 'region'].includes(key))
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = updatedData[key];
        return propObj;
      }, {});

    await super.update(id, partnerProps, options);

    if (updatedData.region) {
      await super.update(id, { regionId: updatedData.region }, options);
    }

    if (updatedData.subscriptionPlanId) {
      const subscriptionPlan = await this.subscriptionPlanRepo
        .getOne(updatedData.subscriptionPlanId, options);

      if (!subscriptionPlan) {
        throw new NotFoundError(SUBSCRIPTION_PLAN_NOT_FOUND);
      }

      await super.update(id, { subscriptionPlanId: updatedData.subscriptionPlanId }, options);
    }

    if (updatedData.services) {
      await PartnerServiceModel.destroy({
        where: {
          partnerId: id
        },
        ...options
      });

      await PartnerServiceModel.bulkCreate(updatedData.services.map((carSupportServiceId) => ({
        partnerId: id,
        carSupportServiceId
      })), options);
    }

    if (updatedData.admins) {
      await AdminPartnerModel.destroy({
        where: {
          partnerId: id
        }
      });

      await AdminPartnerModel.bulkCreate(updatedData.admins.map((adminId) => ({
        partnerId: id,
        adminId
      })), options);
    }

    if (updatedData.cars) {
      await CarPartnerModel.destroy({
        where: {
          partnerId: id
        }
      });

      await CarPartnerModel.bulkCreate(updatedData.cars.map((carId) => ({
        partnerId: id,
        carId
      })), options);
    }
  }
}
