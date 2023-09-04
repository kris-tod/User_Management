import { domain, staticDirname } from '../../config/index.js';

import { FILE_NOT_PROVIDED, FILE_TOO_BIG } from '../../constants/messages.js';

import { MAX_AVATAR_SIZE } from '../../constants/files.js';

export const isFileValid = (req, res, next) => {
  const { file } = req;

  if (!file) {
    res.status(400).send({
      message: FILE_NOT_PROVIDED
    });
    return;
  }

  if (file.size > MAX_AVATAR_SIZE) {
    res.status(400).send({
      message: FILE_TOO_BIG
    });
    return;
  }

  const filePath = domain + file.path.split(staticDirname)[1];
  req.filePath = filePath;

  next();
};
