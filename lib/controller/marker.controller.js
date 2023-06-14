export async function listAllMarkers({ markerModel }) {
  return await markerModel
    .find()
    .sort({timestamp: 1})
    .limit(messageLimit);
}

export async function createMarker({ groupId, owner, lat, lon }, { markerModel }) {
  return await markerModel.create({
    groupId,
    owner,
    lat,
    lon,
  });
}

