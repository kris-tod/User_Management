import express from 'express';
import { isAuth, isTokenNew } from '../../middlewares/index.js';
import { AuthController } from './AuthController.js';
import { BaseController } from '../../../utils/BaseController.js';

const router = express.Router();
const authController = new AuthController();
const { login, logout } = BaseController.prototype.createRouterHandlers
  .call(authController, ['login', 'logout']);

router.post('/login', login);

router.post(
  '/logout',
  isAuth,
  isTokenNew,
  logout
);

export const authRouter = router;
