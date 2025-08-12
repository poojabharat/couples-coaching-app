import React, { useState, useEffect } from 'react'
import { coachFetchJson } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function CoachLogin() {
  const [email, setEmail] = useState('support@poojabharat.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await coachFetchJson('/coach/login', null, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      navigate('/coach/dashboard')
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    // if already authenticated, redirect
    coachFetchJson('/coach/me', null, { credentials: 'include' })
      .then(() => navigate('/coach/dashboard'))
      .catch(() => {})
  }, [])

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Coach Login</h2>
      <p style={{ fontSize: 12, opacity: .8 }}>Access restricted to authorized coaches.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{ color: 'crimson', fontSize: 12 }}>{error}</div>}
        <button type="submit">Sign in</button>
      </form>
    </div>
  )
}

