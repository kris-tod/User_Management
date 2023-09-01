import { USER_NOT_END_USER } from '../utils/messages.js';

export default (req, res, next) => {
    const role = req.userRole;

    if(role != 1) {
        res.status(401).send({
            message: USER_NOT_END_USER
        });

        return;
    }

    next();
}
