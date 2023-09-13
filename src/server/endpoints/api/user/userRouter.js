import express from 'express';
import { UserController } from './UserController.js';
import { createCarsRouter } from './cars/carsRouter.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isFromApp,
  isFileValid,
  uploader
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createUserRouter = (logger) => {
  const router = express.Router();
  const userController = new UserController(logger);

  const { getOne, update, updateAvatar } = userController.createRouterHandlers();

  router.get('/', isAuth, isFromApp(apps.mobile), isTokenNew(logger), getOne);

  router.patch(
    '/',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    update
  );

  router.post(
    '/avatar',
    isAuth,
    isFromApp(apps.mobile),
    isTokenNew(logger),
    uploader.single('avatar'),
    isFileValid,
    updateAvatar
  );

  router.use('/cars', createCarsRouter(logger));

  return router;
};