import express from 'express';
import { isAuth, isTokenNew } from '../../../middlewares/index.js';
import { AuthController } from './AuthController.js';

const router = express.Router();
const authController = new AuthController();
const { login, logout } = authController.createRouterHandlers(['login', 'logout']);

router.post('/login', login);

router.post(
  '/logout',
  isAuth,
  isTokenNew,
  logout
);

export const authRouter = router;
