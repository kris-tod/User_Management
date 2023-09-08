import express from 'express';
import { isAuth, createIsTokenNew } from '../../middlewares/index.js';
import { AuthController } from './AuthController.js';

export const createAuthRouter = (logger) => {
  const router = express.Router();
  const authController = new AuthController(logger);
  const { login, logout } = authController.createRouterHandlers();

  router.post('/login', login);

  router.post('/logout', isAuth, createIsTokenNew(logger), logout);

  return router;
};
