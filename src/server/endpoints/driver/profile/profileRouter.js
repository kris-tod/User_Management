import express from 'express';
import { ProfileController } from './ProfileController.js';

import {
  isAuth,
  isTokenNew,
  isFromApp
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createProfileRouter = (logger) => {
  const router = express.Router();
  const userController = new ProfileController(logger);

  const { getOne, update } = userController.createRouterHandlers();

  router.get('/', isAuth, isFromApp(apps.driver), isTokenNew(logger), getOne);

  router.patch(
    '/',
    isAuth,
    isFromApp(apps.driver),
    isTokenNew(logger),
    update
  );

  return router;
};
