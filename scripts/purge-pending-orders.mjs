import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let serviceKey = '';

for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = trimmed.split('=')[1].replace(/^["']|["']$/g, '');
  } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceKey = trimmed.split('=')[1].replace(/^["']|["']$/g, '');
  }
}

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function purgePending() {
  console.log("Checking orders table in Supabase...");
  const { data: allOrders, error: fetchErr } = await supabase
    .from('orders')
    .select('id, student_id, amount_kes, paystack_reference, status, created_at');

  if (fetchErr) {
    console.error("Fetch error:", fetchErr);
    process.exit(1);
  }

  const pending = (allOrders || []).filter(o => o.status === 'pending');
  console.log(`Found ${allOrders.length} total orders. Pending orders: ${pending.length}`);

  if (pending.length === 0) {
    console.log("No pending orders to purge.");
    return;
  }

  const pendingIds = pending.map(o => o.id);
  console.log("Purging pending order IDs:", pendingIds);

  const { error: delErr } = await supabase
    .from('orders')
    .delete()
    .eq('status', 'pending');

  if (delErr) {
    console.error("Delete error:", delErr);
    process.exit(1);
  }

  console.log(`Successfully purged ${pending.length} pending transaction(s)!`);
}

purgePending();
