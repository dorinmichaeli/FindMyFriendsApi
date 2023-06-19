import { asyncHandler } from '../../shared/tools/async-handler.js';
import { createEvent } from '../../shared/controller/event.controller.js';

const EVENT_NAME_REGEX = /^[a-zA-Z0-9 ,!'"]{4,24}$/;

export function createEventHandlerFactory({eventModel}) {
  return asyncHandler(async (req, res) => {
    const {eventName, markerLocations} = req.body;

    // Validate the event name.
    if (!EVENT_NAME_REGEX.test(eventName)) {
      res.status(400).end(`Invalid event name: ${eventName}`);
      return;
    }

    // Create a new event.
    const eventCreationResult = await createEvent(eventModel, eventName, markerLocations);
    // When creating a new event we get back the event's unique id.
    const eventId = eventCreationResult._doc.eventId;

    // Send the event id back to the client.
    res.json({
      eventId,
      eventName, // Also send the name back for convenience.
    });
  });
}
