import { createMarker } from '../../shared/controller/marker.controller.js';
import { serializeMessage } from '../core/serialize.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';
import { broadcastMessageToGroup } from '../core/broadcast.js';

export async function handleAddMarker(req, { wss, markerModel }) {
  const { lat, lon } = req.data;
  // Validate the lat and lon values sent by the client.
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw new Error('Cannot create marker, invalid marker coordinates.');
  }

  const markerInfo = {
    groupId: req.socket.groupInfo.groupId,
    owner: req.socket.userInfo.email,
    lat: lat,
    lon: lon,
  };

  // Create the marker.
  const createStatus = await createMarker(markerInfo, { markerModel });
  // Get the new marker's id.
  const markerId = createStatus._id.toString();

  // Add the generated id to the message before sending it.
  markerInfo.id = markerId;
  // Serialize the message.
  const outgoingMessage = serializeMessage(SERVER_MESSAGE_TYPE.MARKER_CREATED, markerInfo);
  // Let the group know about the new marker.
  broadcastMessageToGroup(wss, req.socket.groupInfo.groupId, outgoingMessage);
}
