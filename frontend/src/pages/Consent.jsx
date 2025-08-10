import React, { useState } from 'react'
import { useAppStore } from '../store'
import { supabase } from '../supabaseClient'

const API = ''

async function authFetch(path, opts={}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
  const res = await fetch(`${API}${path}`, { ...opts, headers })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

export default function Consent() {
  const coupleId = useAppStore(s => s.coupleId)
  const [sharePartner, setSharePartner] = useState(false)
  const [shareCoach, setShareCoach] = useState(false)
  const [allowText, setAllowText] = useState(false)

  async function save() {
    if (!coupleId) return alert('Join a couple first')
    await authFetch('/consents', {
      method: 'POST',
      body: JSON.stringify({
        couple_id: coupleId,
        share_with_partner: sharePartner,
        share_with_coach: shareCoach,
        allow_raw_text: allowText
      })
    })
    alert('Consent saved')
  }

  return (
    <div>
      <h2>Consent & Sharing</h2>
      <label><input type="checkbox" checked={sharePartner} onChange={e => setSharePartner(e.target.checked)} /> Share detailed answers with my partner</label><br/>
      <label><input type="checkbox" checked={shareCoach} onChange={e => setShareCoach(e.target.checked)} /> Share with a coach (if invited)</label><br/>
      <label><input type="checkbox" checked={allowText} onChange={e => setAllowText(e.target.checked)} /> Allow raw text to be shared</label><br/>
      <button onClick={save}>Save</button>
    </div>
  )
}
