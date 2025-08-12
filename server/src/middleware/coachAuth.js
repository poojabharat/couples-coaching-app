import jwt from 'jsonwebtoken'

export function coachAuth(req, res, next) {
  // Cookie-based session only (production default)
  const token = req.cookies?.coach_session || parseCoachAuthHeader(req.headers['authorization'])
  if (!token) return res.status(401).json({ error: 'Coach authentication required' })
  try {
    const payload = jwt.verify(token, process.env.COACH_SESSION_SECRET || 'change-me')
    if (payload?.role !== 'coach') return res.status(401).json({ error: 'Invalid coach session' })
    req.coach = { email: payload.email }
    return next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired coach session' })
  }
}

function parseCoachAuthHeader(h) {
  if (!h) return null
  if (h.startsWith('Coach ')) return h.slice(6)
  return null
}
