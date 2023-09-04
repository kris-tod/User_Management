import { UserService } from '../../services/UserService.js';

import { BaseController } from './BaseController.js';

export class AdminController extends BaseController {
  constructor() {
    super(UserService);
  }

  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.propertyName];

    const result = await this.service.update(id, { password });
    res.status(200).json(result);
  }
}
