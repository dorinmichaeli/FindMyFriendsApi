export async function listAllMarkers(groupId, { markerModel }) {
  return await markerModel
    .find({ groupId });
}

export async function createMarker({ groupId, owner, lat, lon }, { markerModel }) {
  return await markerModel.create({
    groupId,
    owner,
    lat,
    lon,
  });
}

export async function deleteMarker(markerId, owner, { markerModel }) {
  return await markerModel.findOneAndDelete({
    _id: markerId,
    // Only the owner of the marker can delete it.
    owner: owner,
  });
}

