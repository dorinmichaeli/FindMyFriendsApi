export function notFound404(req, res) {
  // Let the user know the requested resource doesn't exist.
  res.status(404)
    .end('404 Not Found');
}
