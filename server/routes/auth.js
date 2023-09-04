import { post } from '../controllers/auth.js';
import { isAuth, isTokenNew } from '../middlewares/index.js';
import express from 'express'

const router = express.Router();

router.post('/login', post.login);

router.post('/logout', 
    isAuth, 
    isTokenNew,
    post.logout);

export const authRouter = router;
