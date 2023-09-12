import express from 'express';
import { isAuth, isTokenNew, isFromApp } from '../../../middlewares/index.js';
import { AdminAuthController } from './AdminAuthController.js';
import { apps } from '../../../../constants/apps.js';

export const createAdminAuthRouter = (logger) => {
  const router = express.Router();
  const authController = new AdminAuthController(logger);
  const { login, logout } = authController.createRouterHandlers();

  router.post('/login', login);

  router.post('/logout', isAuth, isFromApp(apps.web), isTokenNew(logger), logout);

  return router;
};
