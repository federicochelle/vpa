alter table public.inquiries
add column google_event_id text,
add column meet_url text,
add column meeting_start timestamptz,
add column meeting_end timestamptz,
add column meeting_status text;

alter table public.inquiries
add constraint inquiries_meeting_status_check check (
  meeting_status is null or meeting_status in ('scheduled', 'cancelled')
);

alter table public.inquiries
add constraint inquiries_meeting_time_check check (
  (meeting_start is null and meeting_end is null)
  or (meeting_start is not null and meeting_end is not null and meeting_end > meeting_start)
);

create unique index idx_inquiries_google_event_id
on public.inquiries (google_event_id)
where google_event_id is not null;
