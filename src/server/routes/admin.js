import express from 'express';
import { AdminController } from '../controllers/AdminController.js';
import {
  isAuth,
  isTokenNew,
  isAdmin,
  isPasswordValid,
  isEmailValid,
  isUsernameValid
} from '../middlewares/index.js';

const router = express.Router();
const adminController = new AdminController();

router.get(
  '/',
  isAuth,
  isTokenNew,
  isAdmin,
  adminController.getAll.bind(adminController)
);

router.post(
  '/',
  isUsernameValid,
  isPasswordValid,
  isEmailValid,
  isAuth,
  isTokenNew,
  isAdmin,
  adminController.create.bind(adminController)
);

router.patch(
  '/:id/password',
  isPasswordValid,
  isAuth,
  isTokenNew,
  isAdmin,
  adminController.update.bind(adminController)
);

router.delete(
  '/:id',
  isAuth,
  isTokenNew,
  isAdmin,
  adminController.destroy.bind(adminController)
);

export const adminRouter = router;
