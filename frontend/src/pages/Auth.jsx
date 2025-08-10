import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Auth({ session }) {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function signIn(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd })
    setLoading(false)
    if (error) alert(error.message)
    else navigate('/couple')
  }

  async function signUp(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password: pwd })
    setLoading(false)
    if (error) alert(error.message)
    else alert('Account created. Please sign in.')
  }

  if (session) return <div>You're signed in as <b>{session.user?.email}</b>.</div>

  return (
    <div>
      <h2>Sign in / Sign up</h2>
      <form onSubmit={signIn} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={loading} type="submit">Sign in</button>
          <button disabled={loading} onClick={signUp}>Sign up</button>
        </div>
      </form>
      <p style={{ marginTop: 12, fontSize: 12, opacity: .8 }}>Use email+password for simplicity here. You can switch to magic links or OAuth later.</p>
    </div>
  )
}
