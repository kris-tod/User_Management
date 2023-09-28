import express from 'express';
import { RequestsController } from './RequestsController.js';
import {
  isAuth,
  isTokenNew,
  isFromApp
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';
import { createWorkCardsRouter } from './workCards/workCardsRouter.js';

export const createRequestsRouter = (logger) => {
  const router = express.Router();
  const requestsController = new RequestsController(logger);
  const {
    getMany, getOne, update, finishRequest
  } = requestsController.createRouterHandlers();

  router.get(
    '/',
    isAuth,
    isFromApp(apps.driver),
    isTokenNew(logger),
    getMany
  );

  router.use('/work-cards', createWorkCardsRouter(logger));

  router.get(
    '/:id',
    isAuth,
    isFromApp(apps.driver),
    isTokenNew(logger),
    getOne
  );

  router.patch(
    '/:id',
    isAuth,
    isFromApp(apps.driver),
    isTokenNew(logger),
    update
  );

  router.post(
    '/:id/work-card',
    isAuth,
    isFromApp(apps.driver),
    isTokenNew(logger),
    finishRequest
  );

  return router;
};
