import { deleteMarker } from '../../shared/controller/marker.controller.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';
import { serializeMessage } from '../core/serialize.js';
import { broadcastMessageToGroup } from '../core/broadcast.js';

export async function handleDeleteMarker(req, { wss, markerModel }) {
  const { markerId } = req.data;
  // Validate the id sent by the client.
  if (typeof markerId !== 'string') {
    throw new Error('Cannot delete marker, missing or invalid marker id.');
  }

  // Delete the marker.
  const deletedMarker = await deleteMarker(markerId, req.socket.userInfo.email, { markerModel });

  if (!deletedMarker) {
    // Let the user know if the marker could not be deleted.
    throw new Error(`Cannot delete marker, either marker with id ${markerId} does not exist, or you don't own it.`);
  }

  // Serialize the message.
  const outgoingMessage = serializeMessage(SERVER_MESSAGE_TYPE.MARKER_DELETED, {
    // Send the id of the deleted marker to the clients,
    // so they can remove it from the map.
    id: markerId,
    // Send some of the info about the now-deleted
    // marker to the clients for convenience.
    groupId: deletedMarker.groupId,
    owner: deletedMarker.owner,
    lat: deletedMarker.lat,
    lon: deletedMarker.lon,
  });
  // Let the group know about the deleted marker.
  broadcastMessageToGroup(wss, req.socket.groupInfo.groupId, outgoingMessage);
}
