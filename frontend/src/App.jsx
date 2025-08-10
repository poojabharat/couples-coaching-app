import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Auth from './pages/Auth.jsx'
import Couple from './pages/Couple.jsx'
import Assessment from './pages/Assessment.jsx'
import Consent from './pages/Consent.jsx'
import Report from './pages/Report.jsx'
import Coach from './pages/Coach.jsx'
import CouplePlan from './pages/CouplePlan.jsx'
import CoachDashboard from './pages/CoachDashboard.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Home</Link>
          {session && <Link to="/couple">Couple</Link>}
          {session && <Link to="/assessment">Assessment</Link>}
          {session && <Link to="/consent">Consent</Link>}
          {session && <Link to="/report">Report</Link>
          {session && <Link to="/plan">Plan</Link>}}
          <Link to="/coach">Coach</Link>
        </nav>
        <div>
          {session ? <button onClick={signOut}>Sign out</button> : <Link to="/">Sign in</Link>}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Auth session={session} />} />
        <Route path="/couple" element={<Couple session={session} />} />
        <Route path="/assessment" element={<Assessment session={session} />} />
        <Route path="/consent" element={<Consent session={session} />} />
        <Route path="/report" element={<Report session={session} />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/plan" element={<CouplePlan />} />
        <Route path="/coach/dashboard" element={<CoachDashboard />} />
      </Routes>
    </div>
  )
}
