import { post } from '../controllers/auth.js';
import middlewares from '../middlewares/index.js';
import express from 'express'

const router = express.Router();

router.post('/login', post.login);

router.post('/logout', 
    middlewares.isAuth, 
    middlewares.isTokenNew, 
    post.logout);

export default router;
