import express from 'express';
import { UserController } from './UserController.js';
import { createCarsRouter } from './cars/carsRouter.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid
} from '../../../middlewares/index.js';

export const createUserRouter = (logger) => {
  const router = express.Router();
  const userController = new UserController(logger);

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

  router.use('/cars', createCarsRouter(logger));

  return router;
};
