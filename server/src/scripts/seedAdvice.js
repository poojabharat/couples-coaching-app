import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const file = path.resolve(process.cwd(), 'seeds', 'advice.seed.json')
const json = JSON.parse(fs.readFileSync(file, 'utf8'))

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE // Required for seeding
if (!supabaseUrl || !serviceKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE in env to seed advice.')
  process.exit(1)
}
const admin = createClient(supabaseUrl, serviceKey)

async function run() {
  // upsert blocks
  for (const b of json.advice_blocks) {
    const { error } = await admin.from('advice_blocks').upsert({
      id: b.id,
      domain: b.domain,
      title: b.title,
      body: b.body,
      steps: b.steps,
      resources: b.resources,
      severity: b.severity
    }, { onConflict: 'id' })
    if (error) { console.error('Block error', b.id, error.message); process.exit(1) }
  }

  for (const r of json.advice_rules) {
    const { error } = await admin.from('advice_rules').upsert({
      domain: r.domain,
      condition: r.condition,
      priority: r.priority,
      advice_block_id: r.advice_block_id
    })
    if (error) { console.error('Rule error', r.advice_block_id, error.message); process.exit(1) }
  }

  console.log('Advice seed complete.')
}
run()
