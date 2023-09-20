import { DriverService } from '../../../../domain/driver/DriverService.js';
import { BaseController } from '../../../../utils/BaseController.js';

export class DriversController extends BaseController {
  constructor(logger) {
    super(new DriverService(logger), logger);
  }

  serializeEntity({
    id,
    name,
    avatar,
    number,
    region,
    partner = null,
    pushNotificationsToken,
    signature,
    description
  }) {
    return {
      id,
      name,
      avatar,
      number,
      region,
      partner,
      pushNotificationsToken,
      signature,
      description
    };
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy']);
  }
}
