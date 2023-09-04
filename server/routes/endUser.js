import { get, patch, post, destroy } from '../controllers/endUser.js';
import express from 'express'
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

const router = express.Router();

router.get('/',
    isAuth,
    isTokenNew,
    get.myInfo);

router.patch('/username', isUsernameValid,
    isAuth,
    isTokenNew,
    patch.username);

router.patch('/email',
    isEmailValid,
    isAuth,
    isTokenNew,
    patch.email);

router.patch('/password',
    isPasswordValid,
    isAuth,
    isTokenNew,
    patch.password);

router.post('/friends',
    isAuth,
    isTokenNew,
    isEndUser,
    post.addFriend);

router.post('/avatar',
    isAuth,
    isTokenNew,
    uploader.single('avatar'),
    isFileValid,
    post.avatar);

router.delete('/friends',
    isAuth,
    isTokenNew,
    isEndUser,
    destroy.removeFriend);

export const endUserRouter = router;
