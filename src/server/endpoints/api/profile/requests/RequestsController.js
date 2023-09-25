import { RequestService } from '../../../../../domain/request/RequestService.js';
import { BaseController } from '../../../../../utils/BaseController.js';

export class RequestsController extends BaseController {
  constructor(logger) {
    super(new RequestService(logger), logger);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy']);
  }
}
