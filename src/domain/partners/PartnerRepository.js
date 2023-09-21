import { Op } from 'sequelize';
import {
  Partner as PartnerModel,
  PartnerService as PartnerServiceModel,
  AdminPartner as AdminPartnerModel,
  CarPartner as CarPartnerModel,
  Region,
  CarSupportService,
  Admin,
  Car,
  SubscriptionPlan,
  Tire
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
      model.subscription_plan,
      model.organizationId,
      model.description,
      model.coordinates,
      model.car_support_services,
      model.admins,
      model.cars
    );
  }

  getWithSortedCarServices(entity) {
    const partner = entity;
    partner.services.sort((a, b) => {
      if (b.isPromoted === a.isPromoted) {
        return a.name.localeCompare(b.name);
      }
      return b.isPromoted - a.isPromoted;
    });
    return partner;
  }

  async getAll(page = 1, optionParam = {}, order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    const {
      rows, count
    } = await this.dbClient.findAndCountAll({
      order,
      include: [Region, CarSupportService, Admin, Car, SubscriptionPlan],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...optionParam
    });

    const data = rows.map((entity) => this.getWithSortedCarServices(this.buildEntity(entity)));

    return {
      total: count,
      data,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
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
      include: [Region, Admin, Car, CarSupportService, SubscriptionPlan],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    const data = rows.map((entity) => this.getWithSortedCarServices(this.buildEntity(entity)));

    return {
      total: count,
      data,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async getAllByIds(page, listOfIds, order = ['name'], entitiesPerPage = MAX_PER_PAGE, filter = {}) {
    const options = {
      where: {
        id: {
          [Op.in]: listOfIds
        },
        ...filter
      }
    };

    const {
      rows
    } = await this.dbClient.findAndCountAll({
      order,
      include: [Region, CarSupportService, Car, Admin, SubscriptionPlan],
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1),
      ...options
    });

    const data = rows.map((entity) => this.getWithSortedCarServices(this.buildEntity(entity)));

    return data;
  }

  async getOne(id, options = {}) {
    const entity = await this.dbClient.findByPk(id, {
      include: [Region, CarSupportService, { model: Car, include: Tire }, Admin, SubscriptionPlan],
      ...options
    });
    if (!entity) {
      throw new NotFoundError(PARTNER_NOT_FOUND);
    }

    return this.getWithSortedCarServices(this.buildEntity(entity));
  }

  async getAllByOrganizationIds(listOfIds) {
    const collection = await this.dbClient.findAll({
      include: [Region, CarSupportService, Car, Admin, SubscriptionPlan],
      where: {
        organizationId: {
          [Op.in]: listOfIds
        }
      }
    });
    return collection.map((entity) => this.getWithSortedCarServices(this.buildEntity(entity)));
  }

  async getAllOfferingServiceByRegion(page, carSupportServiceId, region, order = ['name'], entitiesPerPage = MAX_PER_PAGE) {
    const partnersIds = (await PartnerServiceModel.findAll({
      where: {
        carSupportServiceId
      }
    })).map((entity) => entity.partnerId);

    const partners = await this.getAllByIds(page, partnersIds, order, entitiesPerPage, {
      regionId: region
    });

    return {
      total: partners.length,
      data: partners,
      limit: entitiesPerPage,
      offset: entitiesPerPage * (page - 1)
    };
  }

  async create({
    name, logo, description, address, coordinates, phone, contactPerson,
    region, subscriptionPlan, organizationId, admins,
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
      regionId: region.id,
      subscriptionPlanId: subscriptionPlan.id,
      organizationId
    }, options);

    await AdminPartnerModel.bulkCreate(admins.map((admin) => ({
      adminId: admin.id,
      partnerId: partner.id
    })), options);

    await PartnerServiceModel.bulkCreate(services.map((service) => ({
      carSupportServiceId: service.id,
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
