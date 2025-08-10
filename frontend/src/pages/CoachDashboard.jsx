import React, { useEffect, useState } from 'react'

export default function CoachDashboard() {
  const [rows, setRows] = useState([])
  const [overview, setOverview] = useState(null)
  const [key, setKey] = useState(localStorage.getItem('coachKey') || '')

  useEffect(() => {
    if (!key) return
    localStorage.setItem('coachKey', key)
    fetch('/coach/couples', { headers: { 'x-coach-key': key }})
      .then(r => r.json()).then(setRows)
      .catch(e => alert(e.message))
  }, [key])

  function loadOverview(id) {
    fetch(`/coach/couples/${id}/overview`, { headers: { 'x-coach-key': key }})
      .then(r => r.json()).then(setOverview)
      .catch(e => alert(e.message))
  }

  return (
    <div>
      <h2>Coach Dashboard</h2>
      <input placeholder="Coach API Key" value={key} onChange={e => setKey(e.target.value)} />
      <p style={{ fontSize: 12, opacity: .7 }}>Set COACH_API_KEY on the server and paste it here.</p>
      <table border="1" cellPadding="6">
        <thead><tr><th>Couple</th><th>Risk Index</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.couple_id}>
              <td>{r.couple_id}</td>
              <td>{r.risk_index_0_100}</td>
              <td><button onClick={() => loadOverview(r.couple_id)}>View Plan</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {overview && (
        <div style={{ marginTop: 16 }}>
          <h3>Overview</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(overview, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
