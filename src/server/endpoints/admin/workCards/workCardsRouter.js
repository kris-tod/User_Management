import express from 'express';
import { WorkCardsController } from './WorkCardsController.js';

import {
  isAuth,
  isTokenNew,
  isFromApp
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createWorkCardsRouter = (logger) => {
  const router = express.Router();
  const workCardsController = new WorkCardsController(logger);

  const { getMany } = workCardsController.createRouterHandlers();

  router.get('/', isAuth, isFromApp(apps.web), isTokenNew(logger), getMany);

  return router;
};
