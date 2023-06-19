import {asyncHandler} from '../../shared/tools/async-handler.js';
import {findGroupById} from '../../shared/controller/group.controller.js';

export function checkGroupExistsHandlersFactory({groupModel}) {
  return asyncHandler(async (req, res) => {
    const {groupId} = req.query;

    // Check that group id was provided.
    if (!groupId) {
      res.status(404).end('Missing or empty group id.');
      return;
    }

    // Try to get the group with this id.
    const group = await findGroupById(groupModel, groupId);

    res.json({
      groupId: groupId,
      exists: Boolean(group),
    });
  });
}
