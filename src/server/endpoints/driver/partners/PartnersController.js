import { DriverService } from '../../../../domain/driver/DriverService.js';
import { BaseController } from '../../../../utils/BaseController.js';

export class PartnersController extends BaseController {
  constructor(logger) {
    super(new DriverService(logger), logger);
  }

  serializeEntity(entity) {
    return {
      ...entity,
      admins: undefined
    };
  }

  async getMany(req, res) {
    const { page, service } = req.query;
    const { user } = req;

    const {
      total, data, limit, offset
    } = await this.service.getAllPartners(page, user, service);
    res.status(200).json({
      total,
      data: data.map((entity) => this.serializeEntity(entity)),
      limit,
      offset
    });
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany']);
  }
}
