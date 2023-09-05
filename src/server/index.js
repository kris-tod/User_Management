import 'dotenv/config';

import cookieParser from 'cookie-parser';
import express, { json } from 'express';
import { join } from 'path';

import { port, staticDirname, dirname } from '../config/index.js';
import { errorHandler, urlNotFoundHandler } from './middlewares/index.js';

import { router } from './routes/index.js';

const app = express();

app.use(json());
app.use(cookieParser());
app.use(express.static(join(dirname, 'src', `${staticDirname}`)));

app.use('/api', router);

app.use('*', urlNotFoundHandler);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
