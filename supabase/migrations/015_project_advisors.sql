create table if not exists public.project_advisors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  phone text not null default '',
  whatsapp text not null default '',
  email text,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.projects
add column advisor_id uuid references public.project_advisors (id) on delete set null;

create index if not exists idx_projects_advisor_id on public.projects (advisor_id);
create index if not exists idx_project_advisors_active on public.project_advisors (active);

alter table public.project_advisors enable row level security;

create policy "Public can read active project advisors"
on public.project_advisors
for select
to anon, authenticated
using (active = true);

create policy "Staff can manage project advisors"
on public.project_advisors
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

grant select on table public.project_advisors to anon, authenticated;
grant insert, update, delete on table public.project_advisors to authenticated;

insert into public.project_advisors (name)
values
  ('Virginia'),
  ('Raúl')
on conflict (name) do nothing;
