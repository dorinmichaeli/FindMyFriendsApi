import { serializeMessage } from '../core/serialize.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';

export async function handleClientWelcome(socket) {
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.WELCOME, {
    // Let the user know the name of the group they've joined.
    groupId: socket.groupInfo.groupId,
    groupName: socket.groupInfo.groupName
  });
  socket.send(messageData);
}

