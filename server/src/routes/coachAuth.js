import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

function issueCoachToken(email) {
  const secret = process.env.COACH_SESSION_SECRET || 'change-me'
  const payload = { role: 'coach', email }
  return jwt.sign(payload, secret, { expiresIn: '12h' })
}

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  const allowedEmail = process.env.COACH_USER_EMAIL || 'support@poojabharat.com'
  const pass = process.env.COACH_PASSWORD || process.env.COACH_API_KEY
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  if (email !== allowedEmail) return res.status(401).json({ error: 'Invalid credentials' })
  if (!pass || password !== pass) return res.status(401).json({ error: 'Invalid credentials' })

  const token = issueCoachToken(email)
  const secure = process.env.NODE_ENV === 'production'
  res.cookie('coach_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  })
  res.json({ ok: true })
})

router.post('/logout', (req, res) => {
  res.clearCookie('coach_session', { path: '/' })
  res.json({ ok: true })
})

import { coachAuth } from '../middleware/coachAuth.js'
router.get('/me', coachAuth, (req, res) => {
  res.json({ authenticated: true, email: req.coach?.email || null })
})

export default router

