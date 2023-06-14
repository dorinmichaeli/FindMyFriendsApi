import { serializeMessage } from '../core/serialize.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';
import { broadcastMessageToGroup } from '../core/broadcast.js';

export async function handleNewUserJoined(socket, { wss }) {
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
}
