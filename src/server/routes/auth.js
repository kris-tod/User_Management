import express from 'express';
import { isAuth, isTokenNew } from '../middlewares/index.js';
import { AuthController } from '../controllers/AuthController.js';
import { createAuthControllerFunctions } from '../controllers/authControllerFactory.js';

const router = express.Router();
const authController = new AuthController();
const { login, logout } = createAuthControllerFunctions(authController);

router.post('/login', login);

router.post(
  '/logout',
  isAuth,
  isTokenNew,
  logout
);

export const authRouter = router;
