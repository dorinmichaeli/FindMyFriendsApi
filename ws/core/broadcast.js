import { WebSocket } from 'ws';

export function broadcastMessageToGroup(server, groupId, messageText) {
  for (const client of server.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      // Skip clients that aren't connected.
      continue;
    }
    if (!client.authenticated) {
      // Skip clients that aren't authenticated.
      continue;
    }
    if (client.groupId !== groupId) {
      // Skip clients that aren't in the same group.
      continue;
    }
    client.send(messageText);
  }
}
