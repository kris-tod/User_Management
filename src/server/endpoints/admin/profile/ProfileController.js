import { AdminService } from '../../../../domain/admin/AdminService.js';

import { BaseController } from '../../../../utils/BaseController.js';

export class ProfileController extends BaseController {
  constructor(logger) {
    super(new AdminService(logger), logger);
  }

  serializeEntity({
    id, username, email, region
  }) {
    return {
      id, username, email, region
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
