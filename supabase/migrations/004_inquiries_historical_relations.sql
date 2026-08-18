alter table public.inquiries
drop constraint if exists inquiries_entity_consistency_check;

alter table public.inquiries
add constraint inquiries_entity_consistency_check
check (
  (
    kind = 'property'
    and project_id is null
    and project_unit_id is null
  )
  or (
    kind = 'project'
    and property_id is null
    and project_unit_id is null
  )
  or (
    kind = 'project_unit'
    and property_id is null
    and project_id is null
  )
  or (
    kind = 'general'
    and property_id is null
    and project_id is null
    and project_unit_id is null
  )
);

alter table public.inquiries
drop constraint if exists inquiries_property_id_fkey;

alter table public.inquiries
add constraint inquiries_property_id_fkey
foreign key (property_id)
references public.properties (id)
on delete set null;

alter table public.inquiries
drop constraint if exists inquiries_project_id_fkey;

alter table public.inquiries
add constraint inquiries_project_id_fkey
foreign key (project_id)
references public.projects (id)
on delete set null;

alter table public.inquiries
drop constraint if exists inquiries_project_unit_id_fkey;

alter table public.inquiries
add constraint inquiries_project_unit_id_fkey
foreign key (project_unit_id)
references public.project_units (id)
on delete set null;
