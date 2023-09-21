import { DriverService } from '../../../../domain/driver/DriverService.js';

import { BaseController } from '../../../../utils/BaseController.js';

export class ProfileController extends BaseController {
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
      partner: (partner ? {
        ...partner,
        admins: undefined
      } : null),
      pushNotificationsToken,
      signature,
      description
    };
  }

  async getOne(req, res) {
    const { id } = req.user;

    const entity = await this.service.getOne(id);
    res.status(200).json(this.serializeEntity(entity));
  }

  async update(req, res) {
    const { id } = req.user;
    const { user } = req;

    const updatedData = await this.service.update(id, req.body, user);
    res.status(201).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getOne', 'update']);
  }
}
