import express from 'express';
import { RequestsController } from './RequestsController.js';
import {
  isAuth,
  isTokenNew,
  isFromApp
} from '../../../../middlewares/index.js';
import { apps } from '../../../../../constants/apps.js';

export const createRequestsRouter = (logger) => {
  const router = express.Router();
  const requestsController = new RequestsController(logger);
  const {
    getMany, getOne, create, update, destroy, updateOffer
  } = requestsController.createRouterHandlers();

  router.get(
    '/',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    getMany
  );

  router.get(
    '/:id',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    getOne
  );

  router.post(
    '/',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    create
  );

  router.patch(
    '/:id',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    update
  );

  router.delete(
    '/:id',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    destroy
  );

  router.patch(
    '/offers/:offerId',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    updateOffer
  );

  return router;
};
