import express from 'express';
import { UsersController } from './UsersController.js';
import {
  isAuth,
  isTokenNew,
  isAdmin,
  isPasswordValid,
  isEmailValid,
  isUsernameValid
} from '../../middlewares/index.js';

export const createUsersRouter = (logger) => {
  const router = express.Router();
  const usersController = new UsersController(logger);
  const {
    getMany, create, update, destroy
  } = usersController.createRouterHandlers();

  router.get('/', isAuth, isTokenNew, isAdmin, getMany);

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

  router.delete('/:id', isAuth, isTokenNew, isAdmin, destroy);

  return router;
};
