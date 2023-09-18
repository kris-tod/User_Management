import { AdminService } from '../../../../domain/admin/AdminService.js';
import { BaseController } from '../../../../utils/BaseController.js';
import { serializeAdmins, serializeAdmin } from '../../serialize.js';

export class AdminsController extends BaseController {
  constructor(logger) {
    super(new AdminService(logger), logger);
  }

  async getMany(req, res) {
    const { page } = req.query;
    const { user } = req;

    const {
      total, data, limit, offset
    } = await this.service.getAll(page, user);
    res.status(200).json({
      total, limit, offset, data: serializeAdmins(data)
    });
  }

  async update(req, res) {
    const { password } = req.body;
    const id = req.params[this.identityName];
    const { user } = req;

    const updatedData = await this.service.updateAdminPassword(id, { password }, user);
    res.status(200).json(updatedData);
  }

  async create(req, res) {
    const data = req.body;
    const { user } = req;

    const entity = await this.service.create(data, user);
    res.status(201).json(serializeAdmin(entity));
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'update', 'create', 'destroy']);
  }
}
