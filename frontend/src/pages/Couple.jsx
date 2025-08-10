import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAppStore } from '../store'

const API = '' // same origin

async function authFetch(path, opts={}) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
  const res = await fetch(`${API}${path}`, { ...opts, headers })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

export default function Couple({ session }) {
  const [pairCode, setPairCode] = useState('')
  const [label, setLabel] = useState('A')
  const [result, setResult] = useState(null)
  const setCouple = useAppStore(s => s.setCouple)

  async function createCouple() {
    const data = await authFetch('/couples', { method: 'POST' })
    setResult(data)
  }

  async function joinCouple() {
    const data = await authFetch('/couples/join', {
      method: 'POST',
      body: JSON.stringify({ pair_code: pairCode, label })
    })
    setCouple(data.couple_id, data.label)
    alert('Joined!')
  }

  return (
    <div>
      <h2>Couple setup</h2>
      <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <div style={{ padding: 12, border: '1px solid #ddd' }}>
          <h3>Create Couple</h3>
          <button onClick={createCouple}>Create</button>
          {result && <p>Pair code: <b>{result.pair_code}</b> (share with partner)</p>}
        </div>

        <div style={{ padding: 12, border: '1px solid #ddd' }}>
          <h3>Join by Pair Code</h3>
          <input placeholder="pair code" value={pairCode} onChange={e => setPairCode(e.target.value)} />
          <select value={label} onChange={e => setLabel(e.target.value)}>
            <option value="A">Partner A</option>
            <option value="B">Partner B</option>
          </select>
          <button onClick={joinCouple}>Join</button>
        </div>
      </div>
    </div>
  )
}
