import { WebSocket } from 'ws';

export function broadcastMessageToAuthenticatedClients(server, messageText) {
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
