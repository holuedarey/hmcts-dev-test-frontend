import * as path from 'path';

import { HTTPError } from './HttpError';
import { Nunjucks } from './modules/nunjucks';

import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import { glob } from 'glob';
import favicon from 'serve-favicon';

const { setupDev } = require('./development');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

export const app = express();
app.locals.ENV = env;

new Nunjucks(developmentMode).enableFor(app);

app.use(favicon(path.join(__dirname, '/public/assets/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
  next();
});

setupDev(app, developmentMode);

glob
  .sync(__dirname + '/routes/**/*.+(ts|js)')
  .map(filename => require(filename))
  .forEach(route => route.default(app));

function notFoundHandler(req: Request, res: Response): void {
  res.status(404).render('not-found');
}

function errorHandler(err: HTTPError, req: Request, res: Response, next: NextFunction): void {
  if (!err) {
    next();
    return;
  }

  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
}

app.use(notFoundHandler);
app.use(errorHandler);
