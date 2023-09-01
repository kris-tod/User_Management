import { USER_NOT_END_USER } from '../constants/messages.js';
import roles from '../utils/roles.js'

export default (req, res, next) => {
    const role = req.userRole;

    if(role != roles.endUser) {
        res.status(401).send({
            message: USER_NOT_END_USER
        });

        return;
    }

    next();
}
