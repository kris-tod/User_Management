import { RequestService } from '../../../../../domain/request/RequestService.js';
import { BaseController } from '../../../../../utils/BaseController.js';

export class RequestsController extends BaseController {
  constructor(logger) {
    super(new RequestService(logger), logger);
  }

  async updateOffer(req, res) {
    const { isAccepted } = req.body;
    const { user } = req;
    const { offerId } = req.params;

    const response = await this.service.updateOffer(offerId, { isAccepted }, user);
    res.status(200).json(response);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy', 'updateOffer']);
  }
}
