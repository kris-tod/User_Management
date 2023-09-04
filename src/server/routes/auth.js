import express from 'express';
import { isAuth, isTokenNew } from '../middlewares/index.js';
import { AuthController } from '../controllers/AuthController.js';

const router = express.Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));

router.post(
  '/logout',
  isAuth,
  isTokenNew,
  authController.logout.bind(authController)
);

export const authRouter = router;
