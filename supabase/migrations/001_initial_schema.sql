create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  operation_type text not null check (operation_type in ('sale', 'rent')),
  property_type text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published boolean not null default false,
  featured boolean not null default false,
  price numeric(14, 2) check (price is null or price >= 0),
  currency text check (currency is null or currency in ('USD', 'UYU', 'EUR')),
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  garages integer check (garages is null or garages >= 0),
  built_area numeric(10, 2) check (built_area is null or built_area >= 0),
  total_area numeric(10, 2) check (total_area is null or total_area >= 0),
  land_area numeric(10, 2) check (land_area is null or land_area >= 0),
  description text,
  address text,
  neighborhood text,
  city text,
  department text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  expenses numeric(14, 2) check (expenses is null or expenses >= 0),
  construction_year integer check (
    construction_year is null
    or (construction_year >= 1800 and construction_year <= 3000)
  ),
  investment_opportunity boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url text not null,
  public_id text,
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.features (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.property_features (
  property_id uuid not null references public.properties (id) on delete cascade,
  feature_id uuid not null references public.features (id) on delete cascade,
  primary key (property_id, feature_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  developer_name text,
  construction_status text not null default 'presale' check (
    construction_status in ('presale', 'construction', 'ready_delivery', 'immediate_occupancy')
  ),
  estimated_delivery_date date,
  address text,
  neighborhood text,
  city text,
  department text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  published boolean not null default false,
  featured boolean not null default false,
  is_investment_opportunity boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  public_id text,
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  unit_number text not null,
  floor text,
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms integer check (bathrooms is null or bathrooms >= 0),
  garages integer check (garages is null or garages >= 0),
  built_area numeric(10, 2) check (built_area is null or built_area >= 0),
  total_area numeric(10, 2) check (total_area is null or total_area >= 0),
  price numeric(14, 2) check (price is null or price >= 0),
  currency text check (currency is null or currency in ('USD', 'UYU', 'EUR')),
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, unit_number)
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  project_unit_id uuid references public.project_units (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  source text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default timezone('utc', now()),
  constraint inquiries_related_entity_check check (
    property_id is not null
    or project_id is not null
    or project_unit_id is not null
  )
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  phone text,
  whatsapp text,
  email text,
  instagram_url text,
  facebook_url text,
  address text,
  hero_title text,
  hero_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_properties_status on public.properties (status);
create index if not exists idx_properties_published on public.properties (published);
create index if not exists idx_properties_featured on public.properties (featured);
create index if not exists idx_properties_operation_type on public.properties (operation_type);
create index if not exists idx_properties_property_type on public.properties (property_type);
create index if not exists idx_properties_city on public.properties (city);
create index if not exists idx_properties_neighborhood on public.properties (neighborhood);
create index if not exists idx_properties_investment_opportunity on public.properties (investment_opportunity);
create index if not exists idx_property_images_property_id on public.property_images (property_id);
create index if not exists idx_property_images_cover on public.property_images (property_id, is_cover desc, sort_order asc);
create index if not exists idx_features_category on public.features (category);
create index if not exists idx_property_features_feature_id on public.property_features (feature_id);
create index if not exists idx_projects_published on public.projects (published);
create index if not exists idx_projects_featured on public.projects (featured);
create index if not exists idx_projects_status on public.projects (construction_status);
create index if not exists idx_projects_investment on public.projects (is_investment_opportunity);
create index if not exists idx_project_images_project_id on public.project_images (project_id);
create index if not exists idx_project_images_cover on public.project_images (project_id, is_cover desc, sort_order asc);
create index if not exists idx_project_units_project_id on public.project_units (project_id);
create index if not exists idx_project_units_status on public.project_units (status);
create index if not exists idx_inquiries_property_id on public.inquiries (property_id);
create index if not exists idx_inquiries_project_id on public.inquiries (project_id);
create index if not exists idx_inquiries_project_unit_id on public.inquiries (project_unit_id);
create index if not exists idx_inquiries_status on public.inquiries (status);
create index if not exists idx_inquiries_created_at on public.inquiries (created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
before update on public.properties
for each row
execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists set_project_units_updated_at on public.project_units;
create trigger set_project_units_updated_at
before update on public.project_units
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.features enable row level security;
alter table public.property_features enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.project_units enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

create policy "Public can read published properties"
on public.properties
for select
to anon, authenticated
using (published = true and status = 'published');

create policy "Staff can manage properties"
on public.properties
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can read property images of published properties"
on public.property_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_images.property_id
      and properties.published = true
      and properties.status = 'published'
  )
);

create policy "Staff can manage property images"
on public.property_images
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can read features"
on public.features
for select
to anon, authenticated
using (true);

create policy "Staff can manage features"
on public.features
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can read property feature relations for published properties"
on public.property_features
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties
    where properties.id = property_features.property_id
      and properties.published = true
      and properties.status = 'published'
  )
);

create policy "Staff can manage property feature relations"
on public.property_features
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can read published projects"
on public.projects
for select
to anon, authenticated
using (published = true);

create policy "Staff can manage projects"
on public.projects
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can read project images of published projects"
on public.project_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_images.project_id
      and projects.published = true
  )
);

create policy "Staff can manage project images"
on public.project_images
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can read units of published projects"
on public.project_units
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = project_units.project_id
      and projects.published = true
  )
);

create policy "Staff can manage project units"
on public.project_units
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can insert inquiries"
on public.inquiries
for insert
to anon, authenticated
with check (true);

create policy "Staff can read inquiries"
on public.inquiries
for select
to authenticated
using (public.is_staff());

create policy "Staff can update inquiries"
on public.inquiries
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Staff can delete inquiries"
on public.inquiries
for delete
to authenticated
using (public.is_staff());

create policy "Staff can read profiles"
on public.profiles
for select
to authenticated
using (public.is_staff() or id = auth.uid());

create policy "Staff can manage profiles"
on public.profiles
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Staff can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_staff())
with check (public.is_staff());
