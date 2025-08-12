import React, { useEffect, useState } from 'react'
import { useAppStore } from '../store'
import { authFetchJson, authFetchBlob } from '../lib/api'

export default function Report() {
  const coupleId = useAppStore(s => s.coupleId)
  const [report, setReport] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!coupleId) return
    authFetchJson(`/report/couple/${coupleId}`)
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
      <div style={{ margin: '8px 0' }}>
        <button disabled={downloading} onClick={downloadPdf}>Download Report PDF</button>
      </div>
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

async function downloadPdf() {
  try {
    const coupleId = useAppStore.getState().coupleId
    if (!coupleId) return alert('Join a couple first')
    const blob = await authFetchBlob(`/export/report/${coupleId}`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `couple-report-${coupleId}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert(e.message)
  }
}
