import { nanoid } from 'nanoid';

export async function createEvent(eventModel, eventName, markerLocations) {
  return await eventModel
    .create({
      eventId: nanoid(12),
      eventName: eventName,
      markerLocations: markerLocations,
    });
}

export async function findEventById(eventModel, eventId) {
  return await eventModel
    .findOne({
      eventId: eventId,
    });
}
