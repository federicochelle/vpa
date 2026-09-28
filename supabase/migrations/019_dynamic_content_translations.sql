alter table public.properties
add column if not exists title_en text,
add column if not exists description_en text,
add column if not exists title_de text,
add column if not exists description_de text;

alter table public.projects
add column if not exists name_en text,
add column if not exists description_en text,
add column if not exists name_de text,
add column if not exists description_de text;
