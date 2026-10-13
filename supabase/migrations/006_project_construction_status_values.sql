alter table public.projects
drop constraint if exists projects_construction_status_check;

update public.projects
set construction_status = case construction_status
  when 'planned' then 'presale'
  when 'under_construction' then 'construction'
  when 'finished' then 'immediate_occupancy'
  else construction_status
end;

alter table public.projects
alter column construction_status set default 'presale';

alter table public.projects
add constraint projects_construction_status_check check (
  construction_status in ('presale', 'construction', 'ready_delivery', 'immediate_occupancy')
);
