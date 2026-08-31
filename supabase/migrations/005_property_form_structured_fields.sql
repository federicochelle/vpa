alter table public.properties
add column if not exists kitchen_type text check (
  kitchen_type is null or kitchen_type in ('integrated', 'independent')
),
add column if not exists has_balcony boolean not null default false,
add column if not exists has_terrace boolean not null default false,
add column if not exists disposition text check (
  disposition is null or disposition in ('front', 'back', 'lateral', 'interior')
),
add column if not exists orientation text check (
  orientation is null
  or orientation in (
    'north',
    'south',
    'east',
    'west',
    'northeast',
    'northwest',
    'southeast',
    'southwest'
  )
),
add column if not exists floor text;

alter table public.properties
drop constraint if exists properties_floor_apartment_check;

alter table public.properties
add constraint properties_floor_apartment_check check (
  property_type = 'apartment' or floor is null
);
