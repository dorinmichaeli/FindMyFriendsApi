import express from 'express';
import { notFound404 } from './handlers/404-not-found.handler.js';
import { internalError500 } from './handlers/500-internal-error.handler.js';
import { createGroupHandlerFactory } from './handlers/create-group.handler.js';
import { userAuthMiddlewareFactory } from './middleware/userAuth.middleware.js';
import { healthcheckHandler } from './handlers/healcheck.handler.js';
import { checkGroupExistsHandlersFactory } from './handlers/check-group-exists.handlers.js';
import { createEventHandlerFactory } from './handlers/create-event.handler.js';

export function initRestApi(port, { userAuthService, groupModel, eventModel, markerModel }) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/healthcheck', healthcheckHandler);

  app.use(userAuthMiddlewareFactory({ userAuthService }));
  app.use(express.json());

  app.post('/group/create', createGroupHandlerFactory({ groupModel, eventModel, markerModel }));
  app.get('/group/exists', checkGroupExistsHandlersFactory({ groupModel }));
  app.post('/event/create', createEventHandlerFactory({ eventModel }));
  app.use(notFound404);
  app.use(internalError500);

  const server = app.listen(port, () => {
    const { port } = server.address();
    console.log(`FindMyFriends REST API listening on port ${port}.`);
  });
}

