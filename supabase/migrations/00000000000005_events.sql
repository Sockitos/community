/* EVENTS */
create table public.events (
	id bigint generated by default as identity primary key,
	inserted_at timestamp with time zone default timezone('utc'::text, now()) not null,
	updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
	user_id uuid references public.profiles not null,
	title text not null,
	description text not null,
	image text not null,
	tags text [] not null,
	date timestamp with time zone not null,
	location text not null
);
alter table public.events
add column fts tsvector generated always as (
		to_tsvector('simple', title || ' ' || description)
	) stored;
create index events_fts on public.events using gin (fts);
create trigger handle_updated_at before
update on public.events for each row execute procedure moddatetime (updated_at);
create table public.events_moderation(
	id bigint generated by default as identity primary key,
	inserted_at timestamp with time zone default timezone('utc'::text, now()) not null,
	event_id bigint references public.events on delete cascade not null,
	user_id uuid references public.profiles not null,
	status public.moderation_status not null,
	comment text not null
);
create function public.handle_event_moderation_updates() returns trigger language plpgsql security definer as $$ begin
insert into public.events_moderation (event_id, user_id, status, comment)
values (
		new.id,
		new.user_id,
		'pending'::moderation_status,
		'Pending moderation'
	);
return new;
end;
$$;
create trigger on_events_insert
after
insert on public.events for each row execute procedure public.handle_event_moderation_updates();
create trigger on_events_update
after
update on public.events for each row execute procedure public.handle_event_moderation_updates();
create table public.events_interested(
	id bigint generated by default as identity primary key,
	inserted_at timestamp with time zone default timezone('utc'::text, now()) not null,
	user_id uuid references public.profiles not null,
	event_id bigint references public.events not null,
	unique (user_id, event_id)
);
create function public.get_event_interest_count(event_id bigint, user_id uuid default null) returns table (count bigint, has_interest boolean) language sql security definer as $$
select count(*) as interest_count,
	case
		when exists (
			select 1
			from public.events_interested
			where user_id = user_id
				and event_id = event_id
		) then true
		else false
	end as has_interest
from public.events_interested
where event_id = event_id;
$$;
create view public.latest_events_moderation with (security_invoker = on) as
select distinct on (event_id) *
from public.events_moderation
order by event_id,
	inserted_at desc;
create view public.events_view with (security_invoker = on) as
select e.*,
	m.status as moderation_status
from public.events e
	left join public.latest_events_moderation m on e.id = m.event_id;
create view public.events_tags with (security_invoker = on) as
select unnest(tags) as tag,
	count(*) as count
from public.events
group by tag;
-- Storage Buckets
-- insert into storage.buckets (id, name, public, allowed_mime_types)
-- values ('events', 'Events', true, '{"image/*"}');
-- RLS policies
alter table public.events enable row level security;
alter table public.events_moderation enable row level security;
alter table public.events_interested enable row level security;
create policy "Allow users to read approved events" on public.events for
select using (
		exists (
			select 1
			from public.events_moderation
			where event_id = events.id
				and status = 'approved'::public.moderation_status
		)
	);
create policy "Allow users to read their own events" on public.events for
select using (auth.uid() = user_id);
create policy "Allow users to create their own events" on public.events for
insert with check (
		(
			select authorize('events.create')
		)
		and auth.uid() = user_id
	);
create policy "Allow users to update their own events" on public.events for
update using (
		(
			select authorize('events.update')
		)
		and auth.uid() = user_id
	) with check (auth.uid() = user_id);
create policy "Allow users to delete their own events" on public.events for delete using (
	(
		select authorize('events.delete')
	)
	and auth.uid() = user_id
);
create policy "Allow moderators read all events" on public.events for
select using (
		(
			select authorize('events.moderate')
		)
	);
create policy "Allow moderators update all events" on public.events for
update using (
		(
			select authorize('events.moderate')
		)
	);
create policy "Allow moderators delete all events" on public.events for delete using (
	(
		select authorize('events.moderate')
	)
);
create policy "Allow users to read approved events moderation" on public.events_moderation for
select using (
		status = 'approved'::public.moderation_status
	);
create policy "Allow users to read their own events moderation" on public.events_moderation for
select using (auth.uid() = user_id);
create policy "Allow moderators to read all events moderation" on public.events_moderation for
select using (
		(
			select authorize('events.moderate')
		)
	);
create policy "Allow moderators to insert all events moderation" on public.events_moderation for
insert with check (
		(
			select authorize('events.moderate')
		)
	);
create policy "Allow users to read their own events interested" on public.events_interested for
select using (auth.uid() = user_id);
create policy "Allow users to create their own events interested" on public.events_interested for
insert with check (
		(
			select authorize('events.create')
		)
		and auth.uid() = user_id
	);
create policy "Allow users to delete their own events interested" on public.events_interested for delete using (
	(
		select authorize('events.delete')
	)
	and auth.uid() = user_id
);
create policy "Allow users to upload images for their events" on storage.objects for
insert to authenticated with check (bucket_id = 'events');