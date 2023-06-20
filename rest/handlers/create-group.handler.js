import { createGroup } from '../../shared/controller/group.controller.js';
import { asyncHandler } from '../../shared/tools/async-handler.js';
import { findEventById } from '../../shared/controller/event.controller.js';
import { nanoid } from 'nanoid';

const GROUP_NAME_REGEX = /^[a-zA-Z0-9 ,!'"]{3,32}$/;

export function createGroupHandlerFactory({ groupModel, eventModel, markerModel }) {
  return asyncHandler(async (req, res) => {
    const { groupName, eventId } = req.body;

    // Validate the group name.
    if (!GROUP_NAME_REGEX.test(groupName)) {
      res.status(400).end(`Invalid group name: ${groupName}`);
      return;
    }

    // Generate a unique group id.
    const groupId = nanoid(12);

    // Note: [eventId] is optional.
    if (eventId) {
      // Event id is provided, use that event's markers.

      // Get the event info.
      const event = await findEventById(eventModel, eventId);
      // Make sure such an event exists.
      if (!event) {
        res.status(400).end(`Cannot create group, as the referenced event id was not found: ${eventId}`);
        return;
      }

      // Generate markers for this group, for each of the event marker locations.
      for (const markerLocation of event.markerLocations) {
        await markerModel.create({
          groupId: groupId,
          owner: 'admin',
          title: markerLocation.title,
          lat: markerLocation.lat,
          lon: markerLocation.lon,
        });
      }
    }

    // Create a new group.
    await createGroup(groupModel, groupId, eventId, groupName);
    // TODO: Check if creating the group failed.

    // Send the group id back to the client.
    res.json({
      groupId,
      groupName, // Also send the name back for convenience.
    });
  });
}
