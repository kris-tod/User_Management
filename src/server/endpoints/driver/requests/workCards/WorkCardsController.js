import { RequestService } from '../../../../../domain/request/RequestService.js';
import { BaseController } from '../../../../../utils/BaseController.js';

export class WorkCardsController extends BaseController {
  constructor(logger) {
    super(new RequestService(logger), logger);
  }

  async getMany(req, res) {
    const { page } = req.params;
    const { user } = req;

    const response = await this.service.getAllWorkCards(page, user);
    res.status(200).json(response);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany']);
  }
}
