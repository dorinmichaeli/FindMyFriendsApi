import { serializeMessage } from '../core/serialize.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';
import { broadcastMessageToGroup } from '../core/broadcast.js';

export function handleUserLeft(socket, { wss }) {
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
