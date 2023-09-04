import { 
    DEFAULT_ERROR_MESSAGE,
    URL_NOT_FOUND
} from "../../constants/messages.js";

export const errorHandler = (err, req, res, next) => {
    const response = err.message ? {
        message: err.message
    } : {
        message: DEFAULT_ERROR_MESSAGE
    }

    res.status(err.status || 500).send(response);
};

export const urlNotFoundHandler = (req, res) => {
    res.status(404).send({
        message: URL_NOT_FOUND
    });
};