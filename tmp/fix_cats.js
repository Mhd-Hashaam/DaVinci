require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Checking categories...');
  const { data: cats, error } = await supabase.from('cms_categories').select('*');
  
  if (error) {
    console.error('Error fetching categories:', error);
    process.exit(1);
  }

  console.log('Current categories:', cats.map(c => c.name));

  const required = [
    { name: 'Top Picks', slug: 'top-picks', description: 'Curated top picks for landing page' },
    { name: 'Community Creations', slug: 'community', description: 'Fake community feed items' }
  ];

  for (const req of required) {
    const exists = cats.find(c => c.name === req.name || c.slug === req.slug);
    if (!exists) {
      console.log(`Creating category: ${req.name}`);
      const { error: insError } = await supabase.from('cms_categories').insert(req);
      if (insError) console.error(`Error creating ${req.name}:`, insError);
      else console.log(`Created ${req.name}`);
    } else {
      console.log(`Category exists: ${req.name} (ID: ${exists.id})`);
    }
  }
}

run();
