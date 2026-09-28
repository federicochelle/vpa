alter table public.properties
add column advisor_id uuid references public.project_advisors (id) on delete set null;

create index if not exists idx_properties_advisor_id on public.properties (advisor_id);
