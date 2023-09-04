import { get, post, patch, destroy } from '../controllers/admin.js';
import express from 'express'
import { 
     isAuth, 
     isTokenNew, 
     isAdmin, 
     isPasswordValid,
     isEmailValid,
     isUsernameValid
} from '../middlewares/index.js';

const router = express.Router();

router.get('/', 
     isAuth, 
     isTokenNew,
     isAdmin, 
     get.users);

router.post('/', 
     isUsernameValid,
     isPasswordValid,
     isEmailValid, 
     isAuth, 
     isTokenNew, 
     isAdmin, 
     post.user);

router.patch('/:id/password',
     isPasswordValid, 
     isAuth, 
     isTokenNew, 
     isAdmin, 
     patch.password);

router.delete('/:id', 
     isAuth, 
     isTokenNew, 
     isAdmin,
     destroy.user);

export const adminRouter = router;
