/**
 * Build a 2-week micro-plan from couple domain gaps and advice rules/blocks.
 * Inputs: supabase client, coupleId, assessmentId
 * Output: { issues: [...], plan: { weeks: [{ title, items: [...]}, ...] }, coach_checklist: [...] }
 */
export async function composePlan(supabase, coupleId, assessmentId) {
  // 1) Load gaps + riskIndex
  const { data: gaps, error: gapsErr } = await supabase
    .from('v_couple_domain_gaps')
    .select('domain, score_a, score_b, gap')
    .eq('couple_id', coupleId)
    .eq('assessment_id', assessmentId)
    .order('gap', { ascending: false })
  if (gapsErr) throw gapsErr

  const { data: riskRow } = await supabase
    .from('v_couple_risk_index')
    .select('risk_index_0_100')
    .eq('couple_id', coupleId)
    .eq('assessment_id', assessmentId)
    .maybeSingle()

  // 2) Load advice rules & blocks
  const { data: rules, error: rulesErr } = await supabase
    .from('advice_rules')
    .select('id, domain, condition, priority, advice_block_id')
    .order('priority', { ascending: true })
  if (rulesErr) throw rulesErr

  const { data: blocks, error: blocksErr } = await supabase
    .from('advice_blocks')
    .select('id, domain, title, body, steps, resources, severity')
  if (blocksErr) throw blocksErr

  const blockById = Object.fromEntries((blocks||[]).map(b => [b.id, b]))

  // Pick top 3 issues by gap (with low scores bias)
  const issues = (gaps||[])
    .map(g => ({ ...g, avgScore: (Number(g.score_a||0)+Number(g.score_b||0))/2 }))
    .sort((a,b) => (b.gap - a.gap) || (a.avgScore - b.avgScore))
    .slice(0, 3)

  // Match rules
  function matches(rule, g) {
    const cond = rule.condition || {}
    if (cond.domain && cond.domain !== g.domain) return false
    if (cond.min_gap !== undefined && g.gap < cond.min_gap) return false
    if (cond.max_gap !== undefined && g.gap > cond.max_gap) return false
    if (cond.max_avg_score !== undefined && g.avgScore > cond.max_avg_score) return false
    if (cond.min_avg_score !== undefined && g.avgScore < cond.min_avg_score) return false
    return true
  }

  const chosenBlocks = []
  for (const issue of issues) {
    const eligible = (rules||[]).filter(r => r.domain === issue.domain && matches(r, issue))
    const first = eligible[0]
    if (first && blockById[first.advice_block_id]) {
      chosenBlocks.push({ domain: issue.domain, gap: issue.gap, avgScore: issue.avgScore, block: blockById[first.advice_block_id] })
    }
  }

  // Build 2-week plan (alternate high-effort vs low-effort)
  const weeks = [ { title: 'Week 1 — Foundations', items: [] }, { title: 'Week 2 — Deepening & Repair', items: [] } ]
  const coachChecklist = []

  chosenBlocks.forEach((c, idx) => {
    const steps = Array.isArray(c.block.steps) ? c.block.steps : []
    const resources = Array.isArray(c.block.resources) ? c.block.resources : []
    const item = {
      domain: c.domain,
      title: c.block.title,
      body: c.block.body,
      actions: steps,
      resources
    }
    if (idx === 0) weeks[0].items.push(item)
    else if (idx === 1) weeks[1].items.push(item)
    else {
      // spread remaining across both weeks
      weeks[idx % 2].items.push(item)
    }
    coachChecklist.push(`Verify progress on: ${c.block.title} [${c.domain}]`)
  })

  // Always include Daily Check-In as a universal habit
  weeks[0].items.unshift({
    domain: 'communication',
    title: 'Daily 10-Min Check-In',
    body: '5 minutes to share feelings, 5 minutes to reflect & validate. No fixing, just understanding.',
    actions: [
      'Partner A shares: "One feeling today + why."',
      'Partner B reflects: "What I hear is..." Validate without solving.',
      'Switch roles.'
    ],
    resources: []
  })

  return {
    meta: { risk_index: riskRow?.risk_index_0_100 ?? null },
    issues: issues.map(i => ({ domain: i.domain, gap: i.gap, avgScore: Number(i.avgScore.toFixed(2)) })),
    plan: { weeks },
    coach_checklist: coachChecklist
  }
}
