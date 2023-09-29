import { v4 as uuidv4 } from 'uuid';
import { BaseRepo } from '../../../utils/BaseRepo.js';
import { Protocol as ProtocolModel } from '../../../db/index.js';
import { Protocol } from './Protocol.js';

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
      model.fuelAvailable,
      model.kilometersTravelled,
      model.clientName,
      model.clientNumber,
      model.clientSignature,
      model.driverSignature,
      model.checks
    );
  }
}
