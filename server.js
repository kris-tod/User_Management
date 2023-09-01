import 'dotenv/config'

import cookieParser from 'cookie-parser';
import express, { json } from 'express';
import path, { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { port } from './config/index.js';
import { URL_NOT_FOUND } from './utils/messages.js';

import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import endUserRouter from './routes/endUser.js';

const app = express();

app.use(json());
app.use(cookieParser());
app.use(express.static(join(__dirname, './uploads')));

app.use('/api/users', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', endUserRouter);

app.use('*', (req, res) => {
    res.status(404).send({
        message: URL_NOT_FOUND
    });
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
