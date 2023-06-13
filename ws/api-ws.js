import url from 'url';
import querystring from 'querystring';
import { WebSocketServer } from 'ws';
import { CLIENT_MESSAGE_TYPE, SERVER_MESSAGE_TYPE } from './core/message-types.js';
import { serializeMessage } from './core/serialize.js';
import { handleChatMessage } from './events/chatMessage.event.js';
import { handleUserLeft } from './events/userLeft.event.js';
import { handleClientWelcome } from './events/joinGroupRequest.event.js';
import { findGroupById } from '../lib/controller/group.controller.js';
import { handleNewUserJoined } from './events/newUserJoined.event.js';
import { parseMessage } from './core/parse-message.js';

export function initWsApi(port, { chatMessageModel, groupModel, userAuthService }) {
  const wss = new WebSocketServer({
    port,
  });

  wss.on('listening', () => {
    console.log('WebSocket server listening for incoming connections on port 8080.');
  });

  wss.on('connection', async function (socket, incomingRequest) {
    // Parse the required query parameters from the URL.
    const requestQuery = url.parse(incomingRequest.url).query;
    const { authToken, groupId } = querystring.parse(requestQuery);

    // Authenticate the user.
    const userInfo = await userAuthService.verifyIdToken(authToken);
    if (!userInfo) {
      // Invalid auth token, close the connection immediately.
      sendError(socket, 'Invalid auth token');
      socket.close();
      return;
    }

    // Check if the group they want to join exists.
    const groupInfo = await findGroupById(groupModel, groupId);
    if (!groupInfo) {
      // Unknown group, close the connection immediately.
      sendError(socket, 'Unknown group id: ' + groupId);
      socket.close();
      return;
    }

    // Put the user info on the socket object.
    socket.userInfo = userInfo;
    // Put the group info on the socket object.
    socket.groupInfo = groupInfo;

    // Send a welcome message to the client with some info.
    await handleClientWelcome(socket);
    // Let all the clients know that a new client has joined.
    await handleNewUserJoined(socket, { chatMessageModel, wss });

    socket.on('message', messageBuffer => {
      handleClientMessage(socket, messageBuffer).catch(error => {
        sendError(socket, error.message);
      });
    });

    socket.on('error', err => {
      console.error('Error on client socket:', err);
    });

    socket.on('close', () => {
      // Let the clients know that a client has left.
      handleUserLeft(socket, { wss });
    });
  });

  async function handleClientMessage(socket, messageBuffer) {
    // 1. Parse the message.
    const { messageType, data } = parseMessage(messageBuffer);

    // 2. Construct the request object.
    const req = {
      socket,
      data,
    };

    // 3. Handle the message.
    switch (messageType) {
      case CLIENT_MESSAGE_TYPE.CHAT_MESSAGE:
        // Let the clients know that a new message has been received.
        await handleChatMessage(req, { chatMessageModel, wss });
        break;
      default:
        throw new Error('Unknown message type: ' + messageType);
    }
  }
}

function sendError(socket, errorMessage) {
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.ERROR, errorMessage);
  socket.send(messageData);
}
