import { FILE_NOT_PROVIDED, FILE_TOO_BIG } from '../../constants/messages.js';
import FileService from '../../services/FileService.js';

export const isFileValid = (req, res, next) => {
  const { file } = req;

  if (!file) {
    res.status(400).send({
      message: FILE_NOT_PROVIDED
    });
    return;
  }

  if (file.size > FileService.getAvatarMaxSize()) {
    res.status(400).send({
      message: FILE_TOO_BIG
    });
    return;
  }

  req.filePath = FileService.getFilePath(file);

  next();
};
