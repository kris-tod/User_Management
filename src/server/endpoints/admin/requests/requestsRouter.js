import express from 'express';
import { RequestsController } from './RequestsController.js';
import {
  isAuth,
  isTokenNew,
  isAdmin,
  isFromApp
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createRequestsRouter = (logger) => {
  const router = express.Router();
  const requestsController = new RequestsController(logger);
  const {
    getMany, getOne, create, update, destroy
  } = requestsController.createRouterHandlers();

  router.get(
    '/',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    getMany
  );

  router.get(
    '/:id',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    getOne
  );

  router.post(
    '/',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    create
  );

  router.patch(
    '/:id',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    update
  );

  router.delete(
    '/:id',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    destroy
  );

  return router;
};
