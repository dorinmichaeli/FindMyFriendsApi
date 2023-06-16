export function healthcheckHandler(req, res) {
  res.status(200).json({ status: 'ok' });
}
