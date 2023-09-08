import express from 'express';
import FileService from '../../../domain/services/FileService.js';
import { UserController } from './UserController.js';
import { FriendsController } from './FriendsController.js';

import {
  isAuth,
  createIsTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isEndUser,
  uploader,
  isFileValid
} from '../../middlewares/index.js';

export const createUserRouter = (logger) => {
  const router = express.Router();
  const userController = new UserController(logger);
  const friendsController = new FriendsController(logger);

  const { getOne, update, updateAvatar } = userController.createRouterHandlers();

  const { addFriend, removeFriend } = friendsController.createRouterHandlers();

  router.get('/', isAuth, createIsTokenNew(logger), getOne);

  router.patch('/username', isUsernameValid, isAuth, createIsTokenNew(logger), update);

  router.patch('/email', isEmailValid, isAuth, createIsTokenNew(logger), update);

  router.patch('/password', isPasswordValid, isAuth, createIsTokenNew(logger), update);

  router.post('/friends', isAuth, createIsTokenNew(logger), isEndUser, addFriend);

  router.post(
    '/avatar',
    isAuth,
    createIsTokenNew(logger),
    uploader.single('avatar'),
    isFileValid(FileService),
    updateAvatar
  );

  router.delete('/friends', isAuth, createIsTokenNew(logger), isEndUser, removeFriend);

  return router;
};
