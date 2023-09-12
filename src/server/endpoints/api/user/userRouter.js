import express from 'express';
import { UserController } from './UserController.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  uploader,
  isFileValid
} from '../../../middlewares/index.js';

export const createUserRouter = (logger) => {
  const router = express.Router();
  const userController = new UserController(logger);

  const { getOne, update, updateAvatar } = userController.createRouterHandlers();

  router.get('/', isAuth, isTokenNew(logger), getOne);

  router.patch(
    '/',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    isTokenNew(logger),
    update
  );

  router.post(
    '/avatar',
    isAuth,
    isTokenNew(logger),
    uploader.single('avatar'),
    isFileValid,
    updateAvatar
  );

  return router;
};
