import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>
      <h1>Couples Therapy & Insights</h1>
      <p style={{ maxWidth: 720 }}>
        A privacy‑first platform for couples to assess their relationship, generate a personalized 2‑week plan, and optionally collaborate with a coach.
      </p>

      <h3>How it works</h3>
      <ol style={{ lineHeight: 1.6 }}>
        <li><b>Partner A</b> creates an account and a couple record, then shares the pair code.</li>
        <li><b>Partner B</b> signs up and joins the same couple using the pair code.</li>
        <li>Each partner completes the <b>assessment</b> (private by default; consent controls apply).</li>
        <li>Once both complete, view your <b>Report</b> and <b>Personalized Plan</b>; export PDFs anytime.</li>
        <li>Optional: a coach can use the <b>Coach Dashboard</b> with a secret key for consent‑aware overviews.</li>
      </ol>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Link to="/auth"><button>Get Started — Sign in / Sign up</button></Link>
        <Link to="/coach/dashboard"><button>Coach Dashboard</button></Link>
      </div>

      <p style={{ marginTop: 16, fontSize: 12, opacity: .75 }}>
        Privacy: Your data is protected by Row Level Security (RLS) and module‑level consent (text/media sharing is opt‑in).
      </p>
    </div>
  )
}

