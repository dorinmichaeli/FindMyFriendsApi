export function internalError500(error, req, res, _next) {
  // Log the error to the console.
  console.error('Uncaught error in one of the request handlers.', error);
  // Let the user know something went wrong, but don't give out the details.
  res.status(500)
    .end('500 Internal Server Error');
}
