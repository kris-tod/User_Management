import { hash, compare } from 'bcrypt';

import { saltRounds } from '../config/index.js'

export default class PasswordService {
    static async hashPassword (password) {
        const hashedPassword = await new Promise((resolve, reject) => {
            hash(password, saltRounds, function(err, hash) {
                if (err) reject(err);
                resolve(hash);
            });
        });

        return hashedPassword;
    }

    static async comparePasswords(password1, password2) {
        return await compare(password1, password2);
    }
}

