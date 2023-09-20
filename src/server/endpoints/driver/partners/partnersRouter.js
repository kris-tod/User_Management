import express from 'express';
import { PartnersController } from './PartnersController.js';

import {
  isAuth,
  isTokenNew,
  isFromApp
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createPartnersRouter = (logger) => {
  const router = express.Router();
  const partnersController = new PartnersController(logger);

  const { getMany } = partnersController.createRouterHandlers();

  router.get('/', isAuth, isFromApp(apps.driver), isTokenNew(logger), getMany);

  return router;
};
