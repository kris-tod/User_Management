import isAuth from './isAuth.js';
import isAdmin from './isAdmin.js';
import isEndUser from './isEndUser.js';
import uploader from './uploader.js';
import isTokenNew from './isTokenNew.js';
import isFileValid from './isFileValid.js';
import { isEmailValid, isPasswordValid, isUsernameValid } from './validations.js';

export default {
    isAuth,
    isAdmin,
    isEndUser,
    isEmailValid,
    isPasswordValid,
    isUsernameValid,
    uploader,
    isTokenNew,
    isFileValid
}

