// This helper function lets express work with async request handlers that use
// promises rather than callbacks, allowing express to correctly handle
// errors from rejected promises returned by the async callback.
export function asyncHandler(asyncRouteHandler) {
  return (req, res, next) => {
    Promise.resolve(asyncRouteHandler(req, res))
      .catch(next);
  };
}
