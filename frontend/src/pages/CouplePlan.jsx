import React, { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { authFetchJson, authFetchBlob } from '../lib/api'

export default function CouplePlan() {
  const coupleId = useAppStore(s => s.coupleId)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function generate() {
    if (!coupleId) return alert('Join a couple first')
    setLoading(true)
    try {
      const d = await authFetchJson('/plan/generate', { method: 'POST', body: JSON.stringify({ couple_id: coupleId }) })
      setData(d)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (coupleId) generate() }, [coupleId])

  if (!coupleId) return <div>Join a couple first.</div>
  if (!data) return <div><button disabled={loading} onClick={generate}>Generate Plan</button></div>

  return (
    <div>
      <h2>Personalized Plan</h2>
      <div style={{ margin: '8px 0' }}>
        <button disabled={downloading} onClick={downloadPlanPdf}>Download Plan PDF</button>
      </div>
      <p>Risk Index: <b>{data?.meta?.risk_index ?? 'n/a'}</b></p>
      <h3>Top Issues</h3>
      <ul>
        {data.issues.map(i => <li key={i.domain}><b>{i.domain}</b> — gap {i.gap}, avg score {i.avgScore}</li>)}
      </ul>
      {data.plan.weeks.map((w, idx) => (
        <div key={idx} style={{ marginTop: 12, padding: 12, border: '1px solid #ddd' }}>
          <h3>{w.title}</h3>
          {w.items.map((it, j) => (
            <div key={j} style={{ marginBottom: 10 }}>
              <b>[{it.domain}] {it.title}</b>
              <p>{it.body}</p>
              <ul>{(it.actions||[]).map((a,k) => <li key={k}>{a}</li>)}</ul>
            </div>
          ))}
        </div>
      ))}
      <h3>Coach Checklist</h3>
      <ul>{data.coach_checklist.map((c,i) => <li key={i}>{c}</li>)}</ul>
    </div>
  )
}

async function downloadPlanPdf() {
  try {
    const coupleId = useAppStore.getState().coupleId
    if (!coupleId) return alert('Join a couple first')
    const blob = await authFetchBlob(`/export/plan/${coupleId}`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `couple-plan-${coupleId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert(e.message)
  }
}
