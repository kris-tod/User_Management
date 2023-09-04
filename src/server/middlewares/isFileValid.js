import { FILE_NOT_PROVIDED, FILE_TOO_BIG } from '../../constants/messages.js';

export const isFileValid = (fileService) => (req, res, next) => {
  const { file } = req;

  if (!file) {
    res.status(400).send({
      message: FILE_NOT_PROVIDED
    });
    return;
  }

  if (file.size > fileService.getAvatarMaxSize()) {
    res.status(400).send({
      message: FILE_TOO_BIG
    });
    return;
  }

  req.filePath = fileService.getFilePath(file);

  next();
};
