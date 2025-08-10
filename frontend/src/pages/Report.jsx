import React, { useEffect, useState } from 'react'
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

export default function Report() {
  const coupleId = useAppStore(s => s.coupleId)
  const [report, setReport] = useState(null)

  useEffect(() => {
    if (!coupleId) return
    authFetch(`/report/couple/${coupleId}`)
      .then(setReport)
      .catch(e => alert(e.message))
  }, [coupleId])

  if (!coupleId) return <div>Please join a couple first.</div>
  if (!report) return <div>Report will be available after both partners complete the assessment.</div>

  const domains = report.domains || []

  return (
    <div>
      <h2>Couple Report</h2>
      <p>Risk Index: <b>{report.risk_index ?? 'n/a'}</b></p>
      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Domain</th><th>Score A</th><th>Score B</th><th>Gap</th></tr>
        </thead>
        <tbody>
          {domains.map(d => (
            <tr key={d.domain}>
              <td>{d.domain}</td>
              <td>{d.score_a}</td>
              <td>{d.score_b}</td>
              <td>{d.gap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
