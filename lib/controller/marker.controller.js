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

