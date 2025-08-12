import React, { useEffect, useState } from 'react'
import { authFetchJson } from '../lib/api'

export default function Assessment() {
  const [assessment, setAssessment] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      const { assessment, questions } = await authFetchJson('/assessments/active')
      setAssessment({ ...assessment, questions })
      await authFetchJson('/submissions/start', { method: 'POST' })
    })().catch(err => alert(err.message))
  }, [])

  function setAnswer(qid, value_numeric, value_text) {
    setAnswers(a => ({ ...a, [qid]: { question_id: qid, value_numeric, value_text } }))
  }

  async function saveAll() {
    setLoading(true)
    try {
      const list = Object.values(answers)
      await authFetchJson('/responses/batch', { method: 'POST', body: JSON.stringify({ responses: list }) })
      alert('Saved')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function complete() {
    try {
      await saveAll()
      await authFetchJson('/submissions/complete', { method: 'POST' })
      alert('Submission completed!')
    } catch (e) {
      console.error(e)
    }
  }

  if (!assessment) return <div>Loading…</div>

  return (
    <div>
      <h2>{assessment.title}</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {assessment.questions.map(q => (
          <div key={q.id} style={{ padding: 10, border: '1px solid #eee' }}>
            <div><b>[{q.domain}]</b> {q.prompt}</div>
            {q.qtype === 'likert' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                {[1,2,3,4,5].map(v => (
                  <label key={v}>
                    <input type="radio" name={q.id} onChange={() => setAnswer(q.id, v, null)} />
                    {v}
                  </label>
                ))}
              </div>
            )}
            {q.qtype === 'text' && (
              <textarea rows="3" onChange={e => setAnswer(q.id, null, e.target.value)} />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button disabled={loading} onClick={saveAll}>Save</button>
        <button disabled={loading} onClick={complete}>Complete</button>
      </div>
    </div>
  )
}
