import express from 'express';
import { AdminsController } from './AdminsController.js';
import {
  isAuth,
  isTokenNew,
  isAdmin,
  isPasswordValid,
  isEmailValid,
  isUsernameValid,
  isFromApp
} from '../../../middlewares/index.js';
import { apps } from '../../../../constants/apps.js';

export const createAdminsRouter = (logger) => {
  const router = express.Router();
  const usersController = new AdminsController(logger);
  const {
    getMany, create, update, destroy
  } = usersController.createRouterHandlers();

  router.get(
    '/',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    getMany
  );

  router.post(
    '/',
    isUsernameValid,
    isPasswordValid,
    isEmailValid,
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    create
  );

  router.patch(
    '/:id/password',
    isPasswordValid,
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    update
  );

  router.delete(
    '/:id',
    isAuth,
    isFromApp(apps.web),
    isTokenNew(logger),
    isAdmin,
    destroy
  );

  return router;
};
