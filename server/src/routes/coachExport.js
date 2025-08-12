import { Router } from 'express'
import { coachAuth } from '../middleware/coachAuth.js'
import PDFDocument from 'pdfkit'
import { composePlan } from '../services/plan.js'

const router = Router()
router.use(coachAuth)

function streamPdf(res, filename, build) {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.info = { Title: filename }
  doc.pipe(res)
  build(doc)
  doc.end()
}

// GET /coach/export/report/:coupleId (coach key)
router.get('/report/:coupleId', async (req, res) => {
  try {
    const supabase = req.supabase
    const coupleId = req.params.coupleId

    // active assessment
    const { data: active, error: actErr } = await supabase
      .from('active_assessment').select('*').maybeSingle()
    if (actErr || !active) return res.status(400).json({ error: 'No active assessment' })

    // risk index
    const { data: riskRow, error: riskErr } = await supabase
      .from('v_couple_risk_index')
      .select('risk_index_0_100')
      .eq('couple_id', coupleId)
      .eq('assessment_id', active.id)
      .maybeSingle()
    if (riskErr) return res.status(400).json({ error: riskErr.message })

    // domain gaps and scores
    const { data: domains, error: gapsErr } = await supabase
      .from('v_couple_domain_gaps')
      .select('domain, score_a, score_b, gap')
      .eq('couple_id', coupleId)
      .eq('assessment_id', active.id)
      .order('domain', { ascending: true })
    if (gapsErr) return res.status(400).json({ error: gapsErr.message })

    const payload = {
      risk_index: riskRow?.risk_index_0_100 ?? null,
      domains: domains || []
    }

    // Executive summary: top gaps
    const topGaps = [...(payload.domains || [])]
      .sort((a, b) => Number(b.gap || 0) - Number(a.gap || 0))
      .slice(0, 3)

    streamPdf(res, `coach-couple-report-${coupleId}.pdf`, (doc) => {
      // Executive Summary page
      doc.fontSize(20).text('Executive Summary', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(10)
      doc.text(`Couple: ${coupleId}`)
      doc.text(`Generated: ${new Date().toLocaleString()}`)
      doc.text(`Risk Index: ${payload.risk_index ?? 'n/a'}`)
      doc.moveDown(0.5)
      doc.fontSize(12).text('Focus Areas (Top Gaps):')
      doc.fontSize(10)
      if (topGaps.length === 0) doc.text('- No gaps available')
      topGaps.forEach((g, i) => doc.text(`${i + 1}. ${g.domain} — gap ${g.gap}`))

      doc.addPage()
      doc.fontSize(20).text('Couple Report (Coach)', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(14).text('Domain Scores', { underline: true })
      doc.moveDown(0.25)
      doc.fontSize(10)
      doc.text('Domain'.padEnd(16) + 'Score A'.padEnd(10) + 'Score B'.padEnd(10) + 'Gap')
      payload.domains.forEach(d => {
        const line = `${String(d.domain).padEnd(16)}${String(d.score_a ?? '').padEnd(10)}${String(d.score_b ?? '').padEnd(10)}${String(d.gap ?? '')}`
        doc.text(line)
      })
      doc.moveDown(1)
      doc.fontSize(8).fillColor('#666').text('Note: Raw partner text is not included; coach access follows consent rules.')
      doc.fillColor('black')
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to export coach report' })
  }
})

// GET /coach/export/plan/:coupleId (coach key)
router.get('/plan/:coupleId', async (req, res) => {
  try {
    const supabase = req.supabase
    const coupleId = req.params.coupleId

    const { data: active, error: actErr } = await supabase
      .from('active_assessment').select('*').maybeSingle()
    if (actErr || !active) return res.status(400).json({ error: 'No active assessment' })

    const plan = await composePlan(supabase, coupleId, active.id)

    streamPdf(res, `coach-couple-plan-${coupleId}.pdf`, (doc) => {
      doc.fontSize(20).text('Personalized Plan (Coach)', { align: 'center' })
      doc.moveDown(0.5)
      doc.fontSize(10).text(`Couple: ${coupleId}`)
      doc.text(`Generated: ${new Date().toLocaleString()}`)
      if (plan?.meta?.risk_index !== undefined && plan?.meta?.risk_index !== null) {
        doc.text(`Risk Index: ${plan.meta.risk_index}`)
      }
      doc.moveDown(0.5)

      if (Array.isArray(plan?.issues) && plan.issues.length) {
        doc.fontSize(14).text('Top Issues', { underline: true })
        doc.moveDown(0.25)
        doc.fontSize(10)
        plan.issues.forEach((i, idx) => doc.text(`${idx + 1}. [${i.domain}] gap ${i.gap}, avg score ${i.avgScore}`))
      }

      const weeks = plan?.plan?.weeks || []
      weeks.forEach((w, wi) => {
        doc.addPage()
        doc.fontSize(16).text(w.title)
        doc.moveDown(0.25)
        w.items?.forEach((it, ii) => {
          doc.fontSize(12).text(`${ii + 1}. [${it.domain}] ${it.title}`)
          if (it.body) doc.fontSize(10).text(it.body)
          const actions = Array.isArray(it.actions) ? it.actions : []
          actions.forEach(a => doc.fontSize(10).text(`- ${a}`))
          doc.moveDown(0.25)
        })
      })

      if (Array.isArray(plan?.coach_checklist) && plan.coach_checklist.length) {
        doc.addPage()
        doc.fontSize(14).text('Coach Checklist', { underline: true })
        plan.coach_checklist.forEach(c => doc.fontSize(10).text(`- ${c}`))
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to export coach plan' })
  }
})

export default router
