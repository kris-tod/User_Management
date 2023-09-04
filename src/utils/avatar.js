import { staticDirname, dirname } from '../config/index.js';

export const getAvatarName = (fileName) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  const fileExtension = fileName.substring(lastDotIndex);

  return `img-${Date.now()}${fileExtension}`;
};

export const getDestination = () => `${dirname}/${staticDirname}`;
