alter table public.properties
add column if not exists project_id uuid null;

alter table public.properties
drop constraint if exists properties_project_id_fkey;

alter table public.properties
add constraint properties_project_id_fkey
foreign key (project_id)
references public.projects (id)
on delete set null;

create index if not exists idx_properties_project_id
on public.properties (project_id);
