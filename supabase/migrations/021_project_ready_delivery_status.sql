alter table public.projects
drop constraint if exists projects_construction_status_check;

alter table public.projects
add constraint projects_construction_status_check check (
  construction_status in ('presale', 'construction', 'ready_delivery', 'immediate_occupancy')
);
