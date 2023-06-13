import { connectToMongo } from './lib/tools/connect-mongo.js';
import { loadAppConfig } from './lib/tools/config-loader.js';
import { createChatMessageModel } from './lib/models/chatMessage.model.js';
import { createDummyUserAuthService, createUserAuthService } from './lib/services/userAuth.service.js';
import { initWsApi } from './ws/api-ws.js';
import { initRestApi } from './rest/api-rest.js';
import { createGroupModel } from './lib/models/group.model.js';

const WS_PORT = 8080;
const REST_PORT = 3000;
const TEST_MODE = true;

main().catch(err => {
  console.error('Uncaught error in main():', err);
});

async function main() {
  // Load the application's config.
  const config = await loadAppConfig();
  // Connect to the application's database.
  const client = await connectToMongo(config);
  // Create the data models.
  const chatMessageModel = createChatMessageModel(client);
  const groupModel = createGroupModel(client);
  // Create the user auth service.
  let userAuthService;
  if (TEST_MODE) {
    userAuthService = createDummyUserAuthService();
  } else {
    userAuthService = createUserAuthService(config);
  }

  initWsApi(WS_PORT, { chatMessageModel, groupModel, userAuthService });
  initRestApi(REST_PORT, { groupModel, userAuthService });
}

