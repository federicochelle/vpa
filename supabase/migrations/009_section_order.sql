alter table public.properties
add column section_order integer;

alter table public.projects
add column section_order integer;

alter table public.properties
add constraint properties_section_order_check check (
  section_order is null or section_order between 1 and 99
);

alter table public.projects
add constraint projects_section_order_check check (
  section_order is null or section_order between 1 and 99
);

alter table public.properties
add constraint properties_section_order_key unique (section_order) deferrable initially immediate;

alter table public.projects
add constraint projects_section_order_key unique (section_order) deferrable initially immediate;

create or replace function public.set_section_order(
  p_entity_type text,
  p_entity_id uuid,
  p_section_order integer
)
returns void
language plpgsql
set search_path = public
as $$
declare
  current_order integer;
  occupied_entity_id uuid;
begin
  if p_entity_type not in ('property', 'project') then
    raise exception 'Unsupported section entity type: %', p_entity_type;
  end if;

  if p_section_order is not null and p_section_order not between 1 and 99 then
    raise exception 'Section order must be between 1 and 99';
  end if;

  if p_entity_type = 'property' then
    select section_order
    into current_order
    from public.properties
    where id = p_entity_id
    for update;

    if not found then
      raise exception 'Property not found';
    end if;

    if current_order is not distinct from p_section_order then
      return;
    end if;

    set constraints properties_section_order_key deferred;

    if p_section_order is not null then
      select id
      into occupied_entity_id
      from public.properties
      where section_order = p_section_order
      and id <> p_entity_id
      for update;
    end if;

    if occupied_entity_id is not null then
      update public.properties
      set section_order = current_order
      where id = occupied_entity_id;
    end if;

    update public.properties
    set section_order = p_section_order
    where id = p_entity_id;

    return;
  end if;

  select section_order
  into current_order
  from public.projects
  where id = p_entity_id
  for update;

  if not found then
    raise exception 'Project not found';
  end if;

  if current_order is not distinct from p_section_order then
    return;
  end if;

  set constraints projects_section_order_key deferred;

  if p_section_order is not null then
    select id
    into occupied_entity_id
    from public.projects
    where section_order = p_section_order
    and id <> p_entity_id
    for update;
  end if;

  if occupied_entity_id is not null then
    update public.projects
    set section_order = current_order
    where id = occupied_entity_id;
  end if;

  update public.projects
  set section_order = p_section_order
  where id = p_entity_id;
end;
$$;

revoke all on function public.set_section_order(text, uuid, integer) from public;
grant execute on function public.set_section_order(text, uuid, integer) to authenticated;
