import { connectToMongo } from './shared/tools/connect-mongo.js';
import { loadAppConfig } from './shared/tools/config-loader.js';
import { createChatMessageModel } from './shared/models/chatMessage.model.js';
import { createUserAuthService } from './shared/services/userAuth.service.js';
import { initWsApi } from './ws/api-ws.js';
import { initRestApi } from './rest/api-rest.js';
import { createGroupModel } from './shared/models/group.model.js';
import { createMarkerModel } from './shared/models/marker.model.js';
import { createEventModel } from './shared/models/event.model.js';

const WS_PORT = 8080;
const REST_PORT = 4000;
const TEST_MODE = false;

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
  const markerModel = createMarkerModel(client);
  const eventModel = createEventModel(client);
  // Create the user auth service.
  const userAuthService = createUserAuthService(config, TEST_MODE);

  initWsApi(WS_PORT, {userAuthService, groupModel, chatMessageModel, markerModel});
  initRestApi(REST_PORT, {userAuthService, groupModel, eventModel, markerModel});
}

