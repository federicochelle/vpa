create table if not exists public.home_hero_items (
  id uuid primary key default gen_random_uuid(),
  position integer not null unique check (position between 1 and 3),
  entity_type text not null check (entity_type in ('property', 'project')),
  property_id uuid references public.properties (id) on delete cascade,
  project_id uuid references public.projects (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint home_hero_items_entity_check check (
    (
      entity_type = 'property'
      and property_id is not null
      and project_id is null
    )
    or (
      entity_type = 'project'
      and project_id is not null
      and property_id is null
    )
  )
);

create unique index if not exists idx_home_hero_items_property_id
on public.home_hero_items (property_id)
where property_id is not null;

create unique index if not exists idx_home_hero_items_project_id
on public.home_hero_items (project_id)
where project_id is not null;

create index if not exists idx_home_hero_items_position
on public.home_hero_items (position);

drop trigger if exists set_home_hero_items_updated_at on public.home_hero_items;
create trigger set_home_hero_items_updated_at
before update on public.home_hero_items
for each row
execute function public.set_updated_at();

alter table public.home_hero_items enable row level security;

create policy "Public can read home hero items"
on public.home_hero_items
for select
to anon, authenticated
using (true);

create policy "Staff can manage home hero items"
on public.home_hero_items
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

with ranked_properties as (
  select
    id,
    hero_order,
    row_number() over (
      partition by hero_order
      order by updated_at desc, created_at desc, id
    ) as row_rank
  from public.properties
  where hero_order between 1 and 3
)
insert into public.home_hero_items (
  position,
  entity_type,
  property_id
)
select
  hero_order,
  'property',
  id
from ranked_properties
where row_rank = 1
on conflict (position) do update
set
  entity_type = excluded.entity_type,
  property_id = excluded.property_id,
  project_id = null,
  updated_at = timezone('utc', now());
