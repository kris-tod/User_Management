import { BaseController } from '../../../utils/BaseController.js';

export class UsersController extends BaseController {
  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.identityName];

    const updatedData = await this.service.update(id, { password });
    res.status(200).json(updatedData);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
