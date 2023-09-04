import multer, { diskStorage } from 'multer';

import { getAvatarName, getDestination } from '../../utils/avatar.js';

const filename = (req, file, next) => {
    next(null, getAvatarName(file.originalname));
};

const destination = (req, file, next) => {
    next(null, getDestination());
};

export const uploader = multer({
    storage: diskStorage({ 
        destination, filename
    })
})
