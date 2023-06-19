import express from 'express';
import { notFound404 } from './handlers/404-not-found.handler.js';
import { internalError500 } from './handlers/500-internal-error.handler.js';
import { createGroupHandlerFactory } from './handlers/create-group.handler.js';
import { userAuthMiddlewareFactory } from './middleware/userAuth.middleware.js';
import {healthcheckHandler} from './handlers/healcheck.handler.js';
import {checkGroupExistsHandlersFactory} from './handlers/check-group-exists.handlers.js';

export function initRestApi(port, { groupModel, userAuthService }) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/healthcheck', healthcheckHandler);

  app.use(userAuthMiddlewareFactory({ userAuthService }));
  app.use(express.json());

  app.post('/group/create', createGroupHandlerFactory({ groupModel }));
  app.get('/group/exists', checkGroupExistsHandlersFactory({ groupModel }));
  app.use(notFound404);
  app.use(internalError500);

  const server = app.listen(port, () => {
    const { port } = server.address();
    console.log(`MapLord REST API listening on port ${port}.`);
  });
}

