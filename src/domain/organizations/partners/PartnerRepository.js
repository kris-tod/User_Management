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
  model.carSupportServices,
  model.partnerAdmins,
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

    const collection = await super.getAll(page, ['name'], options);

    const result = await Promise.all(
      collection.map(async (entity) => this.constructPartnerProps(entity))
    );

    return result;
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

    const collection = await super.getAll(page, ['name'], options);

    const result = await Promise.all(
      collection.map(async (entity) => this.constructPartnerProps(entity))
    );

    return result;
  }

  async getOne(id) {
    const entity = await super.getOne(id);

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

    partner.carSupportServices = await this.servicesRepo.getAllByIds(
      servicesIds
    );
    const adminsIds = (
      await AdminPartnerModel.findAll({
        where: {
          partnerId: partner.id
        }
      })
    ).map((serviceEntity) => serviceEntity.adminId);

    partner.partnerAdmins = await this.adminRepo.getAllByIds(adminsIds);

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
    region, subscriptionPlanId, organizationId, partnersAdminsIds,
    carSupportServices
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

    await Promise.all(partnersAdminsIds.map(async (adminId) => {
      await AdminPartnerModel.create({
        adminId,
        partnerId: partner.id
      });
    }));

    await Promise.all(carSupportServices.map(async (carSupportServiceId) => {
      await PartnerServiceModel.create({
        carSupportServiceId,
        partnerId: partner.id
      });
    }));

    return this.getOne(partner.id);
  }

  async update(id, updatedData) {
    const partnerProps = Object.keys(updatedData)
      .filter((key) => !['carSupportServices', 'partnerAdmins', 'cars'].includes(key))
      .reduce((obj, key) => {
        const propObj = obj;
        propObj[key] = updatedData[key];
        return propObj;
      }, {});

    await super.update(id, partnerProps);

    if (updatedData.carSupportServices) {
      await PartnerServiceModel.destroy({
        where: {
          partnerId: id
        }
      });

      await Promise.all(updatedData.carSupportServices.map(async (carSupportServiceId) => {
        await PartnerServiceModel.create({
          partnerId: id,
          carSupportServiceId
        });
      }));
    }

    if (updatedData.partnerAdmins) {
      await AdminPartnerModel.destroy({
        where: {
          partnerId: id
        }
      });

      await Promise.all(updatedData.partnerAdmins.map(async (adminId) => {
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
