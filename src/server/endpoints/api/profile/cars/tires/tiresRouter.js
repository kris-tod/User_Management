import express from 'express';
import { TiresController } from './TiresController.js';
import { apps } from '../../../../../../constants/apps.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isFromApp
} from '../../../../../middlewares/index.js';

export const createTiresRouter = (logger) => {
  const router = express.Router();
  const tiresController = new TiresController(logger);

  const {
    getOne, update, getMany, destroy, create
  } = tiresController.createRouterHandlers();

  router.get('/:id/tires', isAuth, isFromApp(apps.mobile), isTokenNew(logger), getMany);
  router.get('/:id/tires/:tireId', isAuth, isFromApp(apps.mobile), isTokenNew(logger), getOne);

  router.post('/:id/tires', isAuth, isFromApp(apps.mobile), isTokenNew(logger), create);

  router.patch(
    '/:id/tires/:tireId',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    isTokenNew(logger),
    update
  );

  router.delete('/:id/tires/:tireId', isAuth, isFromApp(apps.mobile), isTokenNew(logger), destroy);

  return router;
};
