import 'dotenv/config'

import cookieParser from 'cookie-parser';
import express, { json } from 'express';
import path, { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { port, staticDirname } from '../config/index.js';
import { errorHandler, urlNotFoundHandler } from './middlewares/index.js';

import { adminRouter, authRouter, endUserRouter } from './routes/index.js'

const app = express();

app.use(json());
app.use(cookieParser());
app.use(express.static(join(__dirname, `../${staticDirname}`)));

app.use('/api/users', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', endUserRouter);

app.use('*', (req, res) => {
    res.status(404).send({
        message: URL_NOT_FOUND
    });
});

app.use(urlNotFoundHandler);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
