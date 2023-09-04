import { USER_NOT_ADMIN } from '../../constants/messages.js';
import roles from '../../constants/roles.js'

export const isAdmin = (req, res, next) => {
    const role = req.userRole;
    
    if(role != roles.admin) {
        res.status(401).send({
            message: USER_NOT_ADMIN
        });

        return;
    }

    next();
}
