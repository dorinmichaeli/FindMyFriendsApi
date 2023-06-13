import { createGroup } from '../controller/group.controller.js';
import { asyncHandler } from '../tools/async-handler.js';

const GROUP_NAME_REGEX = /^[a-zA-Z0-9 !'"]{4,32}$/;

export function createGroupHandlerFactory({ groupModel }) {
  return asyncHandler(async (req, res) => {
    const { groupName } = req.body;

    // Validate the group name.
    if (!GROUP_NAME_REGEX.test(groupName)) {
      res.status(404).end(`Invalid group name: ${groupName}`);
      return;
    }

    // Create a new group.
    const groupCreationResult = await createGroup(groupModel, groupName);
    // When creating a new group we get back the group's unique id.
    const groupId = groupCreationResult._doc.groupId;

    // Send the group id back to the client.
    res.json({
      groupName,
      groupId,
    });
  });
}
