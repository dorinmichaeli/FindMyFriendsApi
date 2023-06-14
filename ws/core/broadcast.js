import { WebSocket } from 'ws';

export function broadcastMessageToGroup(server, groupId, messageText) {
  if (!groupId) {
    throw new Error('Cannot broadcast message, missing group id.');
  }
  for (const client of server.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      // Skip clients that aren't connected.
      continue;
    }
    if (client.groupInfo.groupId !== groupId) {
      // Skip clients that aren't in the same group.
      continue;
    }
    client.send(messageText);
  }
}
