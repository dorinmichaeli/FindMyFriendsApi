import { WebSocketServer } from 'ws';
import { CLIENT_MESSAGE_TYPE, SERVER_MESSAGE_TYPE } from './core/message-types.js';
import { serializeMessage } from './core/serialize.js';
import { broadcastMessageToGroup } from './core/broadcast.js';
import { sendHistoryToUser } from './core/history.js';
import { addChatMessage } from '../lib/controller/chatMessage.controller.js';
import { findGroupById } from '../lib/controller/group.controller.js';
import { authenticateMessage } from './core/auth.js';

export function initWsApi(port, { chatMessageModel, groupModel, userAuthService }) {
  const wss = new WebSocketServer({
    port,
  });

  wss.on('listening', () => {
    console.log('WebSocket server listening for incoming connections on port 8080.');
  });

  wss.on('connection', socket => {
    // Clients start out as unauthenticated.
    socket.authenticated = false;

    socket.on('message', async messageBuffer => {
      const messageString = messageBuffer.toString('utf-8');
      const messageType = messageString[0];
      const messageText = messageString.slice(1);

      try {
        switch (messageType) {
          case CLIENT_MESSAGE_TYPE.AUTHENTICATION_REQUEST:
            // Client is attempting to authenticate.
            await handleAuthenticationRequest(socket, messageText);
            break;
          case CLIENT_MESSAGE_TYPE.CHAT_MESSAGE:
            // Let the clients know that a new message has been received.
            await handleChatMessage(socket, messageText);
            break;
          default:
            console.error('Unknown message type:', messageType);
            break;
        }
      } catch (error) {
        sendError(socket, error.message);
      }
    });

    socket.on('error', err => {
      console.error('Error on client socket:', err);
    });

    socket.on('close', () => {
      if (!socket.authenticated) {
        return;
      }

      // Let the clients know that a client has left.
      handleUserLeft(socket);
    });
  });

  async function handleAuthenticationRequest(socket, messageJson) {
    const { userInfo, data } = await authenticateMessage(messageJson, { userAuthService });

    // Get the group info.
    const groupId = data;
    const groupInfo = await findGroupById(groupModel, groupId);
    // Make sure such a group exists.
    if (!groupInfo) {
      throw new Error('Invalid or unknown group id: ' + groupId);
    }

    socket.authenticated = true;
    socket.groupId = groupId;
    socket.userInfo = userInfo;
    // Notify the client that authentication was successful.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.AUTHENTICATED, {
      // Let the user know the name of the group they've joined.
      groupId: groupInfo.groupId,
      groupName: groupInfo.groupName,
    });
    socket.send(messageData);

    // Let the clients know that a new client has joined.
    await notifyUserAuthenticated(socket);
  }

  async function notifyUserAuthenticated(socket) {
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
    // Send the message to all members in group.
    broadcastMessageToGroup(wss, socket.groupId, messageData);

    // Send the chat history to the client.
    await sendHistoryToUser(socket, { chatMessageModel });
  }

  async function handleChatMessage(socket, messageJson) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Authenticate the user.
    const { userInfo, data } = await authenticateMessage(messageJson, { userAuthService });
    // Create a message object.
    const message = {
      userName: userInfo.email,
      timestamp: currentTime,
      text: data,
    };
    // Store the new message in the database.
    addChatMessage(chatMessageModel, message).catch(err => {
      console.error('Error while adding chat message to database:', err);
    });

    // Serialize the message.
    const outgoingMessage = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_MESSAGE, message);
    // Send the chat message to all connected clients.
    broadcastMessageToGroup(wss, socket.groupId, outgoingMessage);
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
    broadcastMessageToGroup(wss, socket.groupId, messageData);
  }
}

function sendError(socket, errorMessage) {
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.ERROR, errorMessage);
  socket.send(messageData);
}
