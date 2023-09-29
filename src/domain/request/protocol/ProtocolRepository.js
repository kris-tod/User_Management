import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepo } from '../../../utils/BaseRepo.js';
import { Protocol as ProtocolModel, RequestProtocol } from '../../../db/index.js';
import { Protocol, protocolTypes } from './Protocol.js';

export class ProtocolRepository extends BaseRepo {
  constructor() {
    super(ProtocolModel);
  }

  generateId() {
    return uuidv4();
  }

  buildEntity(model) {
    return new Protocol(
      model.id,
      model.requestId,
      model.fuelAvailable,
      model.kilometersTravelled,
      model.clientName,
      model.clientNumber,
      model.clientSignature,
      model.driverSignature,
      model.checks,
      model.type
    );
  }

  async getOne(id, options = {}) {
    const entity = await super.getOne(id, options);
    const data = (await RequestProtocol.findOne({
      where: {
        [Op.or]: [
          { transmissiveId: id },
          { preliminaryId: id }
        ]
      }
    }));

    if (data.preliminaryId === id) {
      entity.type = protocolTypes.preliminary;
    }
    else {
      entity.type = protocolTypes.transmissive;
    }
    entity.requestId = data.requestId;
    return this.buildEntity(entity);
  }
}
