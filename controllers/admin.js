import UserService from '../services/UserService.js';

import { 
    PAGE_NOT_PASSED, 
    USER_CREATED, 
    PASSWORD_UPDATED,
    USER_DELETED 
} from '../utils/messages.js';

import { genSalt, hash as _hash } from 'bcrypt';
import { saltRounds } from '../config/index.js';

export const get = {
    users: async (req, res) => {
        const { page } = req.query;

        if (!page || page < 0) {
            res.status(400).json({
                message: PAGE_NOT_PASSED
            });
            return;
        }

        try {
            const data = await UserService.getAll(page);

            res.status(200).json(data);
        }
        catch (err) {
            res.status(500).send(err);
        }
    }
};

export const post = {
    user: (req, res) => {
        const { username, email, password, role } = req.body;

        genSalt(saltRounds, (err, salt) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            _hash(password, salt, async (err, hash) => {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    try {
                        await UserService.createUser(username, hash, role, email);

                        res.status(200).json({
                            message: USER_CREATED
                        });
                    }
                    catch (err) {
                        res.status(500).send(err);
                    }
                }
            });
        });
    }
};
export const patch = {
    password: (req, res) => {
        const { id } = req.params;
        const { password } = req.body;

        genSalt(saltRounds, (err, salt) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            _hash(password, salt, async (err, hash) => {
                if (err) {
                    res.status(500).send(err);
                }
                else {
                    try {
                        await UserService.updatePasswordById(id, hash);

                        res.status(200).json({
                            message: PASSWORD_UPDATED
                        });
                    }
                    catch (err) {
                        res.status(500).json(err);
                    }
                }
            });
        });
    }
};

export const deleteRequests = {
    user: async (req, res) => {
        const { id } = req.params;

        try {
            await UserService.deleteById(id);

            res.status(200).json({
                message: USER_DELETED
            });
        }
        catch (err) {
            res.status(err.status || 500).send(err);
        }
    }
};

