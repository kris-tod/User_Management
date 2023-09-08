import express from 'express';
import { UsersController } from './UsersController.js';
import {
  isAuth,
  createIsTokenNew,
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

  router.get('/', isAuth, createIsTokenNew(logger), isAdmin, getMany);

  router.post(
    '/',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    createIsTokenNew(logger),
    isAdmin,
    create
  );

  router.patch(
    '/:id/password',
    isPasswordValid,
    isAuth,
    createIsTokenNew(logger),
    isAdmin,
    update
  );

  router.delete('/:id', isAuth, createIsTokenNew(logger), isAdmin, destroy);

  return router;
};
