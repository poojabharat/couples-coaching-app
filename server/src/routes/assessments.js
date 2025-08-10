import { Router } from 'express';
const router = Router();

// GET /assessments/active -> active assessment + questions + options
router.get('/active', async (req, res) => {
  const supabase = req.supabase;

  const { data: active, error: actErr } = await supabase
    .from('active_assessment')
    .select('*')
    .maybeSingle();

  if (actErr) return res.status(400).json({ error: actErr.message });
  if (!active) return res.status(404).json({ error: 'No active assessment' });

  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('id, domain, qtype, prompt, weight, required, position')
    .eq('assessment_id', active.id)
    .order('position', { ascending: true });

  if (qErr) return res.status(400).json({ error: qErr.message });

  // load options for those questions
  const qIds = questions.map(q => q.id);
  const { data: options, error: oErr } = await supabase
    .from('question_options')
    .select('id, question_id, label, value')
    .in('question_id', qIds);

  if (oErr) return res.status(400).json({ error: oErr.message });

  const optionsByQ = options.reduce((acc, o) => {
    (acc[o.question_id] ||= []).push(o);
    return acc;
  }, {});

  const payload = {
    assessment: active,
    questions: questions.map(q => ({ ...q, options: optionsByQ[q.id] || [] }))
  };
  res.json(payload);
});

export default router;
