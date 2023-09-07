import fs from 'fs';
import { domain, staticDirname, dirname } from '../../config/index.js';

export default class FileService {
  static getAvatarMaxSize() {
    return 5 * 1024 * 1024;
  }

  static getFilePath(file) {
    return domain + file.path.split(staticDirname)[1];
  }

  static getAvatarName(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    const fileExtension = fileName.substring(lastDotIndex);

    return `img-${Date.now()}${fileExtension}`;
  }

  static getDestination() {
    return `${dirname}/src/${staticDirname}`;
  }

  static deleteFile(file) {
    fs.unlinkSync(`${staticDirname}/${file.filename}`);
  }
}
