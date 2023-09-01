import multer, { diskStorage } from 'multer';
import { staticDirname } from '../config/index.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filename = (req, file, next) => {
    const lastDotIndex =  file.originalname.lastIndexOf('.');
    const fileExtension = file.originalname.substring(lastDotIndex);

    next(null, `img-${Date.now()}${fileExtension}`);
};

const destination = (req, file, next) => {
    next(null, `${__dirname}/../${staticDirname}`);
};

export default multer({
    storage: diskStorage({ 
        destination, filename
    })
})
