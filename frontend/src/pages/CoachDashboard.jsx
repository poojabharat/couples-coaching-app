import React, { useEffect, useState } from 'react'
import { coachFetchJson, coachFetchBlob } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function CoachDashboard() {
  const [rows, setRows] = useState([])
  const [overview, setOverview] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    coachFetchJson('/coach/me', null, { credentials: 'include' })
      .then(() => coachFetchJson(`/coach/couples`, null, { credentials: 'include' }))
      .then(setRows)
      .catch(() => navigate('/coach/login'))
  }, [])

  function loadOverview(id) {
    coachFetchJson(`/coach/couples/${id}/overview`, null, { credentials: 'include' })
      .then(setOverview)
      .catch(e => alert(e.message))
  }

  async function downloadCoachReport(id) {
    try {
      const blob = await coachFetchBlob(`/coach/export/report/${id}`, null, { credentials: 'include' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coach-couple-report-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.message)
    }
  }

  async function downloadCoachPlan(id) {
    try {
      const blob = await coachFetchBlob(`/coach/export/plan/${id}`, null, { credentials: 'include' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coach-couple-plan-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Coach Dashboard</h2>
        <button onClick={async () => { try { await coachFetchJson('/coach/logout', null, { method: 'POST', credentials: 'include' }); navigate('/coach/login') } catch(e) { alert(e.message) } }}>Logout</button>
      </div>
      <p className="muted" style={{ fontSize: 12 }}>Authenticated via secure coach session.</p>
      <table border="1" cellPadding="6">
        <thead><tr><th>Couple</th><th>Risk Index</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.couple_id}>
              <td>{r.couple_id}</td>
              <td>{r.risk_index_0_100}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => loadOverview(r.couple_id)}>View Plan</button>
                <button onClick={() => downloadCoachReport(r.couple_id)}>Report PDF</button>
                <button onClick={() => downloadCoachPlan(r.couple_id)}>Plan PDF</button>
              </td>
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
