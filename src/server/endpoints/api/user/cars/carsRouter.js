import express from 'express';
import { CarsController } from './CarsController.js';
import { apps } from '../../../../../constants/apps.js';
import { createTiresRouter } from './tires/tiresRouter.js';

import {
  isAuth,
  isTokenNew,
  isFromApp
} from '../../../../middlewares/index.js';

export const createCarsRouter = (logger) => {
  const router = express.Router();
  const carsController = new CarsController(logger);

  const {
    getMany, getOne, create, update, destroy
  } = carsController.createRouterHandlers();

  router.get('/', isAuth, isFromApp(apps.mobile), isTokenNew(logger), getMany);

  router.get(
    '/:id',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    getOne
  );

  router.post('/', isAuth, isFromApp(apps.mobile), isTokenNew(logger), create);

  router.patch(
    '/:id',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    update
  );

  router.delete('/:id', isAuth, isFromApp(apps.mobile), isTokenNew(logger), destroy);

  router.use('/', createTiresRouter(logger));

  return router;
};
