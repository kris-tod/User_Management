import 'dotenv/config';

import cookieParser from 'cookie-parser';
import express, { json } from 'express';

import {
  port, staticDirPath
} from '../config/index.js';
import { errorHandler, urlNotFoundHandler } from './middlewares/index.js';

import { router } from './endpoints/routes/index.js';

const app = express();

app.use(json());
app.use(cookieParser());
app.use(express.static(staticDirPath));

app.use('/api', router);

app.use('*', urlNotFoundHandler);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
