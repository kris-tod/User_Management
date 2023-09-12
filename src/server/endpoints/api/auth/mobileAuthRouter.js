import express from 'express';
import { isAuth, isFromApp, isTokenNew } from '../../../middlewares/index.js';
import { MobileAuthController } from './MobileAuthController.js';
import { apps } from '../../../../constants/apps.js';

export const createMobileAuthRouter = (logger) => {
  const router = express.Router();
  const authController = new MobileAuthController(logger);
  const { login, logout, register } = authController.createRouterHandlers();

  router.post('/login', login);

  router.post('/register', register);

  router.post('/logout', isAuth, isFromApp(apps.mobile), isTokenNew(logger), logout);

  return router;
};
