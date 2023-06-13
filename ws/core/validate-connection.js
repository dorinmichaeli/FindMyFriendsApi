import url from 'node:url';
import querystring from 'node:querystring';
import { findGroupById } from '../../lib/controller/group.controller.js';

export async function validateInitialConnection(socket, incomingRequest, { userAuthService, groupModel }) {
  // Parse the required query parameters from the URL.
  const requestQuery = url.parse(incomingRequest.url).query;
  const { authToken, groupId } = querystring.parse(requestQuery);

  if (!authToken) {
    // No auth token, close the connection immediately.
    throw new Error('Missing auth token.');
    // sendError(socket, 'Missing auth token.');
    // socket.close();
  }
  if (!groupId) {
    // No group id, close the connection immediately.
    throw new Error('Missing group id.');
    // sendError(socket, 'Missing group id.');
    // socket.close();
  }

  // Authenticate the user.
  const userInfo = await userAuthService.verifyIdToken(authToken);
  if (!userInfo) {
    // Invalid auth token, close the connection immediately.
    throw new Error('Invalid auth token');
    // sendError(socket, 'Invalid auth token');
    // socket.close();
  }

  // Check if the group they want to join exists.
  const groupInfo = await findGroupById(groupModel, groupId);
  if (!groupInfo) {
    // Unknown group, close the connection immediately.
    throw new Error('Unknown group id: ' + groupId);
    // sendError(socket, 'Unknown group id: ' + groupId);
    // socket.close();
  }

  return { userInfo, groupInfo };
}
