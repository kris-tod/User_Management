import { USER_NOT_ADMIN } from '../utils/messages.js';

export default (req, res, next) => {
    const role = req.userRole;

    if(role != 0) {
        res.status(401).send({
            message: USER_NOT_ADMIN
        });

        return;
    }

    next();
}
