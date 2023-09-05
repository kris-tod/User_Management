import express from 'express';
import { isAuth, isTokenNew } from '../../middlewares/index.js';
import { AuthController } from './AuthController.js';
import { UserService } from '../../../services/UserService.js';

export const createAuthRouter = (logger) => {
  const router = express.Router();
  const userService = new UserService(logger);
  const authController = new AuthController(userService);
  const { login, logout } = authController.createRouterHandlers();

  router.post('/login', login);

  router.post('/logout', isAuth, isTokenNew, logout);

  return router;
};
