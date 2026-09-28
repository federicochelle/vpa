alter table public.inquiries
add column if not exists intent text,
add column if not exists medium text,
add column if not exists campaign text,
add column if not exists referrer text,
add column if not exists landing_page text;

alter table public.inquiries
drop constraint if exists inquiries_intent_check;

alter table public.inquiries
add constraint inquiries_intent_check
check (
  intent is null
  or intent in ('general', 'advisory', 'contact', 'sell', 'valuation', 'investment')
);
