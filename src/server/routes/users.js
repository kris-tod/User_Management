import express from 'express';
import { UsersController } from '../controllers/UsersController.js';
import { createUsersControllerFunctions } from '../controllers/usersControllerFactory.js';
import {
  isAuth,
  isTokenNew,
  isAdmin,
  isPasswordValid,
  isEmailValid,
  isUsernameValid
} from '../middlewares/index.js';

const router = express.Router();
const usersController = new UsersController();
const {
  getMany, create, update, destroy
} = createUsersControllerFunctions(usersController);

router.get(
  '/',
  isAuth,
  isTokenNew,
  isAdmin,
  getMany
);

router.post(
  '/',
  isUsernameValid,
  isPasswordValid,
  isEmailValid,
  isAuth,
  isTokenNew,
  isAdmin,
  create
);

router.patch(
  '/:id/password',
  isPasswordValid,
  isAuth,
  isTokenNew,
  isAdmin,
  update
);

router.delete(
  '/:id',
  isAuth,
  isTokenNew,
  isAdmin,
  destroy
);

export const usersRouter = router;
