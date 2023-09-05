import 'dotenv/config';

import cookieParser from 'cookie-parser';
import express, { json } from 'express';

import {
  errorLogPath,
  infoLogPath,
  port, staticDirPath
} from '../config/index.js';
import { errorHandler, urlNotFoundHandler } from './middlewares/index.js';
import { Logger } from '../utils/Logger.js';
import { createRouter } from './routes/index.js';

const logger = new Logger(errorLogPath, infoLogPath);

const app = express();

app.use(json());
app.use(cookieParser());
app.use(express.static(staticDirPath));

app.use('/api', createRouter(logger));

app.use('*', urlNotFoundHandler);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
