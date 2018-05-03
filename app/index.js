#!/usr/bin/env node

'use strict';

// Load APM on production environment
const config = require('./config');
const apm = require('./apm');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const views = require('koa-views');
const errorHandler = require('./middlewares/errorHandler');
const logMiddleware = require('./middlewares/log');
const logger = require('./logger');
const requestId = require('./middlewares/requestId');
const responseHandler = require('./middlewares/responseHandler');
const index = require('./routes/index');
const users = require('./routes/users');

require('./services/mongoose_service');

const app = new Koa();

// Trust proxy
app.proxy = true;

// Set middlewares
app.use(
  bodyParser({
    enableTypes: ['json', 'form'],
    formLimit: '10mb',
    jsonLimit: '10mb'
  })
);
app.use(requestId());
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
    exposeHeaders: ['X-Request-Id']
  })
);
app.use(responseHandler());
app.use(errorHandler());
app.use(logMiddleware({ logger }));
app.use(views(__dirname + '/views', {
  extension: 'html'
}));

// Bootstrap application router
router.use('/', index.routes(), index.allowedMethods());
router.use('/users', users.routes(), users.allowedMethods());

function onError(err) {
  if (apm.active)
    apm.captureError(err);
  logger.error({ err, event: 'error' }, 'Unhandled exception occured');
}

// Handle uncaught errors
app.on('error', onError);

// Start server
if (!module.parent) {
  const server = app.listen(config.port, config.host, () => {
    logger.info({ event: 'execute' }, `API server listening on ${config.host}:${config.port}, in ${config.env}`);
  });
  server.on('error', onError);
}

// Expose app
module.exports = app;
