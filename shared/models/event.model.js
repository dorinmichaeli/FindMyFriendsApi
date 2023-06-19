import mongoose from 'mongoose';

const eventMarkerLocationSchema = new mongoose.Schema({
  lat: {type: Number, required: true},
  lon: {type: Number, required: true},
});

const eventSchema = new mongoose.Schema({
  eventId: {type: String, required: true},
  eventName: {type: String, required: true},
  markerLocations: [eventMarkerLocationSchema],
});

export function createEventModel(client) {
  return client.model('Event', eventSchema);
}
