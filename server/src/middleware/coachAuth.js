export function coachAuth(req, res, next) {
  const key = req.headers['x-coach-key'] || req.headers['x-api-key']
  if (!key || key !== process.env.COACH_API_KEY) {
    return res.status(401).json({ error: 'Coach API key missing or invalid' })
  }
  next()
}
