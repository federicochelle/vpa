alter table public.inquiries
add column if not exists kind text;

alter table public.inquiries
add column if not exists origin_path text;

alter table public.inquiries
add column if not exists related_title text;

update public.inquiries
set kind = case
  when property_id is not null then 'property'
  when project_id is not null then 'project'
  when project_unit_id is not null then 'project_unit'
  else 'general'
end
where kind is null;

alter table public.inquiries
alter column kind set default 'general';

alter table public.inquiries
alter column kind set not null;

alter table public.inquiries
drop constraint if exists inquiries_related_entity_check;

alter table public.inquiries
drop constraint if exists inquiries_kind_check;

alter table public.inquiries
add constraint inquiries_kind_check
check (kind in ('property', 'project', 'project_unit', 'general'));

alter table public.inquiries
drop constraint if exists inquiries_entity_consistency_check;

alter table public.inquiries
add constraint inquiries_entity_consistency_check
check (
  (
    kind = 'property'
    and property_id is not null
    and project_id is null
    and project_unit_id is null
  )
  or (
    kind = 'project'
    and property_id is null
    and project_id is not null
    and project_unit_id is null
  )
  or (
    kind = 'project_unit'
    and property_id is null
    and project_id is null
    and project_unit_id is not null
  )
  or (
    kind = 'general'
    and property_id is null
    and project_id is null
    and project_unit_id is null
  )
);

create index if not exists idx_inquiries_kind on public.inquiries (kind);

drop policy if exists "Public can insert inquiries" on public.inquiries;
