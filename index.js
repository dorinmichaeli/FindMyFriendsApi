import {nanoid} from 'nanoid';
import {WebSocketServer, WebSocket} from 'ws';
import {connectToMongo} from './lib/tools/connect-mongo.js';
import {loadAppConfig} from './lib/tools/config-loader.js';
import {createChatMessageModel} from './lib/models/chatMessage.model.js';
import {addChatMessage, getChatMessageHistory} from './lib/controller/chatMessage.controller.js';

const MESSAGE_TYPE = {
  USER_JOINED: 'A',
  CHAT_MESSAGE: 'B',
  USER_LEFT: 'C',
  CHAT_HISTORY: 'D',
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

  const server = new WebSocketServer({
    port: 8080,
  });

  server.on('listening', () => {
    console.log('WebSocket server listening for incoming connections on port 8080.');
  });

  server.on('connection', socket => {
    // Generate a unique ID for this client.
    socket.id = nanoid();
    // Send the chat history to the client.
    sendHistory(socket);
    // Let the clients know that a new client has joined.
    broadcastUserJoined(socket);

    socket.on('message', messageBuffer => {
      // Let the clients know that a new message has been received.
      broadcastChatMessage(socket, messageBuffer);
    });

    socket.on('error', err => {
      console.error('Error on client socket:', err);
    });

    socket.on('close', () => {
      // Let the clients know that a client has left.
      broadcastUserLeft(socket);
    });
  });

  function broadcastUserJoined(socket) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user joined message object.
    const userJoinedMessage = {
      timestamp: currentTime,
      userId: socket.id,
    };

    // Serialize the message.
    const messageData = serializeMessage(MESSAGE_TYPE.USER_JOINED, userJoinedMessage);
    // Send the message to all connected clients.
    broadcastMessage(server, messageData);
  }

  function broadcastChatMessage(socket, messageBuffer) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Convert the message to a string.
    const messageText = messageBuffer.toString('utf-8');
    // Create a message object.
    const message = {
      userId: socket.id,
      timestamp: currentTime,
      text: messageText,
    };
    // Store the new message in the database.
    /* TODO: await? */
    addChatMessage(chatMessageModel, message)

    // Serialize the message.
    const messageData = serializeMessage(MESSAGE_TYPE.CHAT_MESSAGE, message);
    // Send the chat message to all connected clients.
    broadcastMessage(server, messageData);
  }

  function broadcastUserLeft(socket) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user left message object.
    const userLeftMessage = {
      timestamp: currentTime,
      userId: socket.id,
    };

    // Serialize the message.
    const messageData = serializeMessage(MESSAGE_TYPE.USER_LEFT, userLeftMessage);
    // Send the message to all connected clients.
    broadcastMessage(server, messageData);
  }

  async function sendHistory(socket) {
    // Load the chat history from the database.
    const messageHistory = await getChatMessageHistory(chatMessageModel);
    // Serialize it.
    const messageData = serializeMessage(MESSAGE_TYPE.CHAT_HISTORY, messageHistory);
    // Send it to the client.
    socket.send(messageData);
  }
}

function broadcastMessage(server, messageText) {
  for (const client of server.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageText);
    }
  }
}

function serializeMessage(messageType, messageObject) {
  return messageType + JSON.stringify(messageObject);
}
