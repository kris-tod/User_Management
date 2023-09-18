import express from 'express';
import { ProfileController } from './ProfileController.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isFromApp
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createProfileRouter = (logger) => {
  const router = express.Router();
  const userController = new ProfileController(logger);

  const { getOne, update } = userController.createRouterHandlers();

  router.get('/', isAuth, isFromApp(apps.web), isTokenNew(logger), getOne);

  router.patch(
    '/',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    update
  );

  return router;
};
