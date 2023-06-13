// Create a middleware that authenticates requests from clients. If a request
// cannot be authenticated then it will be rejected with a 401 error.
export function userAuthMiddlewareFactory({userAuthService}) {
  return (req, res, next) => {
    let token = req.headers['auth'];
    if (!token) {
      res.status(401).end('Unauthorized, no token provided.');
      return;
    }
    if (Array.isArray(token)) {
      // If multiple "auth" headers are provided, use the first one.
      token = token[0];
    }

    userAuthService.verifyIdToken(token)
      .then(decoded => {
        // decoded -> firebase.auth.DecodedIdToken
        req.userInfo = decoded;
        next();
      })
      .catch(_error => {
        res.status(401).end('Unauthorized, invalid token provided.');
      });
  };
}
