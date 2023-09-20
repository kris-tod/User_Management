import { AdminService } from '../../../../domain/admin/AdminService.js';
import { BaseController } from '../../../../utils/BaseController.js';

export class AdminsController extends BaseController {
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

  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.identityName];
    const { user } = req;

    const updatedData = await this.service.updateAdminPassword(id, { password }, user);
    res.status(200).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
