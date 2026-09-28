alter table public.inquiries
drop constraint if exists inquiries_intent_check;

alter table public.inquiries
add constraint inquiries_intent_check
check (
  intent is null
  or intent in ('general', 'advisory', 'contact', 'sell', 'valuation', 'investment', 'professional_report')
);
