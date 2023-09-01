import { get, patch, post, deleteRequests } from '../controllers/endUser.js';
import express from 'express'
import middlewares from '../middlewares/index.js';

const router = express.Router();

router.get('/',
    middlewares.isAuth,
    middlewares.isTokenNew,
    get.myInfo);

router.patch('/username', middlewares.isUsernameValid,
    middlewares.isAuth,
    middlewares.isTokenNew,
    patch.username);

router.patch('/email',
    middlewares.isEmailValid,
    middlewares.isAuth,
    middlewares.isTokenNew,
    patch.email);

router.patch('/password',
    middlewares.isPasswordValid,
    middlewares.isAuth,
    middlewares.isTokenNew,
    patch.password);

router.post('/friends',
    middlewares.isAuth,
    middlewares.isTokenNew,
    middlewares.isEndUser,
    post.addFriend);

router.post('/avatar',
    middlewares.isAuth,
    middlewares.isTokenNew,
    middlewares.uploader.single('avatar'),
    post.avatar);

router.delete('/friends',
    middlewares.isAuth,
    middlewares.isTokenNew,
    middlewares.isEndUser,
    deleteRequests.removeFriend);

export default router;
