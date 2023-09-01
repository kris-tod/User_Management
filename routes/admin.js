import { get, post, patch, deleteRequests } from '../controllers/admin.js';
import express from 'express'
import middlewares from '../middlewares/index.js';

const router = express.Router();

router.get('/', 
     middlewares.isAuth, 
     middlewares.isTokenNew,
     middlewares.isAdmin, 
     get.users);

router.post('/', middlewares.isUsernameValid,
     middlewares.isPasswordValid,
     middlewares.isEmailValid, 
     middlewares.isAuth, 
     middlewares.isTokenNew, 
     middlewares.isAdmin, 
     post.user);

router.patch('/:id/password',
     middlewares.isPasswordValid, 
     middlewares.isAuth, 
     middlewares.isTokenNew, 
     middlewares.isAdmin, 
     patch.password);

router.delete('/:id', 
     middlewares.isAuth, 
     middlewares.isTokenNew, 
     middlewares.isAdmin,
     deleteRequests.user);

export default router;
