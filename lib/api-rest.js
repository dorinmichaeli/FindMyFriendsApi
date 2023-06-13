import express from 'express';
import { notFound404 } from './handlers/404-not-found.handler.js';
import { internalError500 } from './handlers/500-internal-error.handler.js';
import { createGroupHandlerFactory } from './handlers/create-group.handler.js';

export function initRestApi(port, { groupModel }) {
  const app = express();
  app.use(express.json());

  app.post('/group/create', createGroupHandlerFactory({ groupModel }));
  app.use(notFound404);
  app.use(internalError500);

  const server = app.listen(port, () => {
    const { port } = server.address();
    console.log(`MapLord REST API listening on port ${port}.`);
  });
}

