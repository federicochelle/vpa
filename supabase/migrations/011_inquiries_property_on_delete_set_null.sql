alter table public.inquiries
alter column property_id drop not null;

alter table public.inquiries
drop constraint if exists inquiries_property_id_fkey;

alter table public.inquiries
add constraint inquiries_property_id_fkey
foreign key (property_id)
references public.properties (id)
on delete set null;
