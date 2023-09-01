import { User, Friendship } from '../models/db.js';
import { Op } from 'sequelize';

const MAX_PER_PAGE = 5;

class UserService {
    static getAll(page) {
        return User.findAll({
            order: [['username']],
            limit: MAX_PER_PAGE, offset: MAX_PER_PAGE * (page - 1)
        });
    }    

    static getById(id) {
        return User.findOne({ where: { id } });
    }

    static getByUsername(username) {
        return User.findOne({ where: { username } });
    }

    static createUser(username, password, role, email) {
        return User.create({
            username,
            email,
            password,
            role
        });
    }

    static updatePasswordById(id, password) {
        return User.update({
            password
        }, {
            where: { id }
        });
    }

    static updateAvatarById(id, avatar) {
        return User.update({ avatar }, { where: { id } });
    }

    static updateUsernameById(id, username) {
        return User.findOne({ where: { id } })
            .then(data => {
                const user = data.toJSON();

                return Promise.all([
                    User.update({ username }, { where: { id } }),
                    Friendship.update({ username }, { where: { username: user.username } }),
                    Friendship.update({ friend_username: username }, { where: { friend_username: user.username }})
                ]);
            });
    }

    static updateEmailById(id, email) {
        return User.update({ email }, { where: { id } });
    }

    static deleteById(id) {
        return User.findOne({ where: { id } })
            .then(data => {
                const username = data.toJSON().username;

                return Promise.all([
                    User.destroy({ where: { id } }),
                    Friendship.destroy({ where: {
                        [Op.or]: [
                            { username: username },
                            { friend_username: username }
                        ]
                    }})
                ]);
            });
    }
}

export default UserService;
