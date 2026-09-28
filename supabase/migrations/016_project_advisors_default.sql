alter table public.project_advisors
add column is_default boolean not null default false;

alter table public.project_advisors
add constraint project_advisors_default_must_be_active_check
check (is_default = false or active = true);

create unique index if not exists idx_project_advisors_single_default
on public.project_advisors (is_default)
where is_default = true;

update public.project_advisors
set is_default = true,
    active = true
where name = 'Virginia'
  and not exists (
    select 1
    from public.project_advisors existing_default
    where existing_default.is_default = true
  );
