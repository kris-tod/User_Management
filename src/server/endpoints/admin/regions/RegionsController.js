import { BaseController } from '../../../../utils/BaseController.js';
import { RegionService } from '../../../../domain/region/RegionService.js';

export class RegionsController extends BaseController {
  constructor(logger) {
    super(new RegionService(logger), logger);
  }

  createRouterHandlers() {
    return super.createRouterHandlers(['getMany', 'getOne', 'create', 'update', 'destroy']);
  }
}
