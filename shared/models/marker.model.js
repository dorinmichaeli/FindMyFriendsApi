import mongoose from 'mongoose';

const markerSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  owner: { type: String, require: true },
  title: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
});

export function createMarkerModel(client) {
  return client.model('Marker', markerSchema);
}
