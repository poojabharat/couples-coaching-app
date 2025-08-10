import { Router } from 'express';
const router = Router();

// POST /couples -> create a couple; sets created_by to auth.uid()
router.post('/', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('couples')
    .insert({ created_by: userId })
    .select('id, pair_code')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// POST /couples/join -> { pair_code, label: 'A'|'B' }
router.post('/join', async (req, res) => {
  const supabase = req.supabase;
  const userId = req.user.id;
  const { pair_code, label } = req.body;

  if (!pair_code || !['A','B'].includes(label)) {
    return res.status(400).json({ error: 'pair_code and label A|B required' });
  }

  const { data: couple, error: findErr } = await supabase
    .from('couples')
    .select('id')
    .eq('pair_code', pair_code)
    .single();

  if (findErr || !couple) return res.status(404).json({ error: 'Invalid pair_code' });

  // insert membership
  const { data: member, error: memErr } = await supabase
    .from('couple_members')
    .insert({ couple_id: couple.id, user_id: userId, label })
    .select('id, couple_id, label')
    .single();

  if (memErr) return res.status(400).json({ error: memErr.message });
  res.json(member);
});

export default router;
