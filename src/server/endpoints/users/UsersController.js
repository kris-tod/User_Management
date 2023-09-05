import { UserService } from '../../../services/UserService.js';

import { BaseController } from '../../../utils/BaseController.js';

export class UsersController extends BaseController {
  constructor() {
    super(UserService);
  }

  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.identityName];

    const updatedData = await this.service.update(id, { password });
    res.status(200).json(updatedData);
  }
}
