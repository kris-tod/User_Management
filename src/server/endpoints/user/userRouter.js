import express from 'express';
import FileService from '../../../services/FileService.js';
import { UserController } from './UserController.js';
import { FriendsController } from './FriendsController.js';

import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isEndUser,
  uploader,
  isFileValid
} from '../../middlewares/index.js';
import { UserService } from '../../../services/UserService.js';

export const createUserRouter = (logger) => {
  const router = express.Router();
  const userService = new UserService(logger);
  const userController = new UserController(userService);
  const friendsController = new FriendsController(userService);

  const { getOne, update, updateAvatar } = userController.createRouterHandlers();

  const { addFriend, removeFriend } = friendsController.createRouterHandlers();

  router.get('/', isAuth, isTokenNew, getOne);

  router.patch('/username', isUsernameValid, isAuth, isTokenNew, update);

  router.patch('/email', isEmailValid, isAuth, isTokenNew, update);

  router.patch('/password', isPasswordValid, isAuth, isTokenNew, update);

  router.post('/friends', isAuth, isTokenNew, isEndUser, addFriend);

  router.post(
    '/avatar',
    isAuth,
    isTokenNew,
    uploader.single('avatar'),
    isFileValid(FileService),
    updateAvatar
  );

  router.delete('/friends', isAuth, isTokenNew, isEndUser, removeFriend);

  return router;
};
