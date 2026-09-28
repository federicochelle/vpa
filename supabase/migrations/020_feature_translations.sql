alter table public.features
add column if not exists name_en text,
add column if not exists name_de text;
