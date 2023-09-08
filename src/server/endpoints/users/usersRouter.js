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

  router.get('/', isAuth, isTokenNew(logger), isAdmin, getMany);

  router.post(
    '/',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    isTokenNew(logger),
    isAdmin,
    create
  );

  router.patch(
    '/:id/password',
    isPasswordValid,
    isAuth,
    isTokenNew(logger),
    isAdmin,
    update
  );

  router.delete('/:id', isAuth, isTokenNew(logger), isAdmin, destroy);

  return router;
};
