-- Create fitting_room_progress table
create table if not exists public.fitting_room_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- User-Facing Metadata
  title text default 'Session – ' || to_char(now(), 'Mon DD, YYYY'),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Preview Assets
  preview_url text, -- Full-size preview (800x600)
  preview_thumbnail_url text, -- Compressed thumbnail (400x300)
  
  -- Complete State Snapshot (Normalized)
  state jsonb not null,
  
  -- Versioning & Debugging
  app_version text default '1.0',
  schema_version integer default 1,
  
  -- Validation
  constraint state_valid check (jsonb_typeof(state) = 'object')
);

-- Performance Indexes
create index if not exists idx_fitting_progress_user_created 
  on public.fitting_room_progress(user_id, created_at desc);

create index if not exists idx_fitting_progress_updated 
  on public.fitting_room_progress(updated_at desc);

-- RLS Policies
alter table public.fitting_room_progress enable row level security;

create policy "Users view own progress"
  on public.fitting_room_progress for select
  using (auth.uid() = user_id);

create policy "Users create own progress"
  on public.fitting_room_progress for insert
  with check (auth.uid() = user_id);

create policy "Users update own progress"
  on public.fitting_room_progress for update
  using (auth.uid() = user_id);

create policy "Users delete own progress"
  on public.fitting_room_progress for delete
  using (auth.uid() = user_id);

-- Storage Bucket Setup (Idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fitting-progress-previews', 
  'fitting-progress-previews', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage Policies
create policy "Public Access to Previews"
  on storage.objects for select
  using ( bucket_id = 'fitting-progress-previews' );

create policy "Users can upload own previews"
  on storage.objects for insert
  with check (
    bucket_id = 'fitting-progress-previews' 
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can update own previews"
  on storage.objects for update
  using (
    bucket_id = 'fitting-progress-previews'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can delete own previews"
  on storage.objects for delete
  using (
    bucket_id = 'fitting-progress-previews'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );
