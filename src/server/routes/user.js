import express from 'express';
import FileService from '../../services/FileService.js';
import { UserController } from '../controllers/UserController.js';
import { createUserControllerFunctions } from '../controllers/userControllerFactory.js';
import { FriendsController } from '../controllers/FriendsController.js';
import { createFriendsControllerFunctions } from '../controllers/friendsControllerFactory.js';
import {
  isAuth,
  isTokenNew,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  isEndUser,
  uploader,
  isFileValid
} from '../middlewares/index.js';
import { UserService } from '../../services/UserService.js';

const router = express.Router();

const userController = new UserController();
const friendsController = new FriendsController(UserService);

const {
  getOne, update, updateAvatar
} = createUserControllerFunctions(userController);

const { addFriend, removeFriend } = createFriendsControllerFunctions(friendsController);

router.get(
  '/',
  isAuth,
  isTokenNew,
  getOne
);

router.patch(
  '/username',
  isUsernameValid,
  isAuth,
  isTokenNew,
  update
);

router.patch(
  '/email',
  isEmailValid,
  isAuth,
  isTokenNew,
  update
);

router.patch(
  '/password',
  isPasswordValid,
  isAuth,
  isTokenNew,
  update
);

router.post(
  '/friends',
  isAuth,
  isTokenNew,
  isEndUser,
  addFriend
);

router.post(
  '/avatar',
  isAuth,
  isTokenNew,
  uploader.single('avatar'),
  isFileValid(FileService),
  updateAvatar
);

router.delete(
  '/friends',
  isAuth,
  isTokenNew,
  isEndUser,
  removeFriend
);

export const userRouter = router;
