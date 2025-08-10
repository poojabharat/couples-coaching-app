import { Router } from 'express';
const router = Router();

// GET /report/couple/:id -> calls RPC get_couple_report
router.get('/couple/:id', async (req, res) => {
  const supabase = req.supabase;
  const coupleId = req.params.id;

  const { data, error } = await supabase
    .rpc('get_couple_report', { p_couple_id: coupleId });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
