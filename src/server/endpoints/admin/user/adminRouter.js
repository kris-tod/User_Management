import express from 'express';
import { AdminController } from './AdminController.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid
} from '../../../middlewares/index.js';

export const createUserRouter = (logger) => {
  const router = express.Router();
  const userController = new AdminController(logger);

  const { getOne, update } = userController.createRouterHandlers();

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

  return router;
};
