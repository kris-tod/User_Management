import { hash, compare } from 'bcrypt';

import { saltRounds } from '../../config/index.js';

export default class PasswordService {
  static async hashPassword(password) {
    const hashedPassword = await new Promise((resolve, reject) => {
      hash(password, saltRounds, (err, hashString) => {
        if (err) reject(err);
        resolve(hashString);
      });
    });

    return hashedPassword;
  }

  static async comparePasswords(password1, password2) {
    return compare(password1, password2);
  }
}
