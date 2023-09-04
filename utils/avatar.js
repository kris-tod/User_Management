import path from 'path';
import { fileURLToPath } from 'url';

import { staticDirname } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAvatarName = (fileName) => {
    const lastDotIndex =  fileName.lastIndexOf('.');
    const fileExtension = fileName.substring(lastDotIndex);

    return `img-${Date.now()}${fileExtension}`;
};

export const getDestination = () => {
    return `${__dirname}/../${staticDirname}`;
};