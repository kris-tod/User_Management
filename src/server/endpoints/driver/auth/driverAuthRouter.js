import express from 'express';
import { isAuth, isTokenNew, isFromApp } from '../../../middlewares/index.js';
import { DriverAuthController } from './DriverAuthController.js';
import { apps } from '../../../../constants/apps.js';

export const createDriverAuthRouter = (logger) => {
  const router = express.Router();
  const authController = new DriverAuthController(logger);
  const { login, logout } = authController.createRouterHandlers();

  router.post('/login', login);

  router.post('/logout', isAuth, isFromApp(apps.driver), isTokenNew(logger), logout);

  return router;
};
