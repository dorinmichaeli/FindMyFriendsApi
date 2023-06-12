import {WebSocketServer, WebSocket} from 'ws';
import {connectToMongo} from './lib/tools/connect-mongo.js';
import {loadAppConfig} from './lib/tools/config-loader.js';
import {createChatMessageModel} from './lib/models/chatMessage.model.js';
import {addChatMessage, getChatMessageHistory} from './lib/controller/chatMessage.controller.js';
import {createUserAuthService} from './lib/services/userAuth.service.js';

const SERVER_MESSAGE_TYPE = {
  USER_JOINED: 'A',
  CHAT_MESSAGE: 'B',
  USER_LEFT: 'C',
  CHAT_HISTORY: 'D',
  ERROR: 'E',
  AUTHENTICATED: 'F',
};

const CLIENT_MESSAGE_TYPE = {
  AUTHENTICATION_REQUEST: 'z',
  CHAT_MESSAGE: 'y',
};

main().catch(err => {
  console.error('Uncaught error in main():', err);
});

async function main() {
  // Load the application's config.
  const config = await loadAppConfig();
  // Connect to the application's database.
  const client = await connectToMongo(config);
  // Create the chat message model.
  const chatMessageModel = createChatMessageModel(client);
  // Create the user auth service.
  const userAuthService = createUserAuthService(config);

  const server = new WebSocketServer({
    port: 8080,
  });

  server.on('listening', () => {
    console.log('WebSocket server listening for incoming connections on port 8080.');
  });

  server.on('connection', socket => {
    // Clients start out as unauthenticated.
    socket.authenticated = false;

    socket.on('message', messageBuffer => {
      const messageString = messageBuffer.toString('utf-8');
      const messageType = messageString[0];
      const messageText = messageString.slice(1);

      switch (messageType) {
        case CLIENT_MESSAGE_TYPE.AUTHENTICATION_REQUEST:
          // Client is attempting to authenticate.
          handleAuthenticationRequest(socket, messageText);
          break;
        case CLIENT_MESSAGE_TYPE.CHAT_MESSAGE:
          // Let the clients know that a new message has been received.
          handleChatMessage(socket, messageText);
          break;
        default:
          console.error('Unknown message type:', messageType);
          break;
      }
    });

    socket.on('error', err => {
      console.error('Error on client socket:', err);
    });

    socket.on('close', () => {
      // Let the clients know that a client has left.
      handleUserLeft(socket);
    });
  });

  function handleUserAuthenticated(socket) {
    if (!socket.authenticated || !socket.userInfo) {
      console.error('handleUserAuthenticatedAndJoined() called on unauthenticated socket!');
      return;
    }

    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user joined message object.
    const userJoinedMessage = {
      timestamp: currentTime,
      userName: socket.userInfo.email,
    };

    // Serialize the message.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.USER_JOINED, userJoinedMessage);
    // Send the message to all connected clients.
    broadcastMessageToAuthenticatedClients(server, messageData);

    // Send the chat history to the client.
    sendHistoryToUser(socket);
  }

  async function handleAuthenticationRequest(socket, messageText) {
    const authToken = messageText;
    // Authenticate the user.
    const userInfo = await userAuthService.verifyIdToken(authToken);
    if (!userInfo) {
      sendError(socket, 'Invalid auth token: ' + authToken);
      return;
    }
    socket.authenticated = true;
    socket.userInfo = userInfo;
    // Notify the client that authentication was successful.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.AUTHENTICATED, '');
    socket.send(messageData);

    // Let the clients know that a new client has joined.
    handleUserAuthenticated(socket);
  }

  async function handleChatMessage(socket, messageText) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();

    // Split the message into an auth token and message text.
    const parts = messageText.split('::');
    if (parts.length !== 2) {
      sendError(socket, 'Invalid chat message format: ' + messageText);
      return;
    }
    const [authToken, chatText] = parts;

    // Authenticate the user.
    const userInfo = await userAuthService.verifyIdToken(authToken);
    if (!userInfo) {
      sendError(socket, 'Invalid auth token: ' + authToken);
      return;
    }

    // Create a message object.
    const message = {
      userEmail: userInfo.email,
      timestamp: currentTime,
      text: chatText,
    };
    // Store the new message in the database.
    addChatMessage(chatMessageModel, message).catch(err => {
      console.error('Error while adding chat message to database:', err);
    });

    // Serialize the message.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_MESSAGE, message);
    // Send the chat message to all connected clients.
    broadcastMessageToAuthenticatedClients(server, messageData);
  }

  function handleUserLeft(socket) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user left message object.
    const userLeftMessage = {
      timestamp: currentTime,
      userName: socket.userInfo.email,
    };

    // Serialize the message.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.USER_LEFT, userLeftMessage);
    // Send the message to all connected clients.
    broadcastMessageToAuthenticatedClients(server, messageData);
  }

  async function sendHistoryToUser(socket) {
    // Load the chat history from the database.
    const messageHistory = await getChatMessageHistory(chatMessageModel);
    // Serialize it.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_HISTORY, messageHistory);
    // Send it to the client.
    socket.send(messageData);
  }

  function sendError(socket, errorMessage) {
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.ERROR, errorMessage);
    socket.send(messageData);
  }
}

function broadcastMessageToAuthenticatedClients(server, messageText) {
  for (const client of server.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      // Skip clients that aren't connected.
      return;
    }
    if (!client.authenticated) {
      // Skip clients that aren't authenticated.
      return;
    }
    client.send(messageText);
  }
}

function serializeMessage(messageType, messageObject) {
  return messageType + JSON.stringify(messageObject);
}
