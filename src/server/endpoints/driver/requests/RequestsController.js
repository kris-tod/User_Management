import { RequestService } from '../../../../domain/request/RequestService.js';
import { BaseController } from '../../../../utils/BaseController.js';

export class RequestsController extends BaseController {
  constructor(logger) {
    super(new RequestService(logger), logger);
  }

  async finishRequest(req, res) {
    const { id } = req.params;
    const { user } = req;
    const data = req.body;

    const response = await this.service.finishRequest(id, data, user);
    res.status(200).json(response);
  }

  async addProtocol(req, res) {
    const { id } = req.params;
    const { user } = req;
    const data = req.body;

    const response = await this.service.createProtocol(id, data, user);
    res.status(200).json(response);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'update', 'finishRequest', 'addProtocol']);
  }
}
