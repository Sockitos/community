import type { User } from '@supabase/supabase-js';

export type Feature = 'map' | 'howtos' | 'events' | 'academy';

export type UserRole = 'user' | 'moderator' | 'admin';

export type UserWithRole = User & { role: UserRole };

export type UserProfile = {
	id: string;
	inserted_at: string;
	updated_at: string;
	role: UserRole;
	type: string;
	email: string;
	display_name: string;
	description: string | null;
	avatar: string | null;
};

export type UserType = {
	slug: string;
	label: string;
	is_default: boolean;
};

export type Branding = {
	name: string;
	slogan: string;
	logo?: string | null;
	color_theme: string;
	radius: number;
};

export type ModerationStatus = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export type ModerationInfo = {
	status: ModerationStatus;
	inserted_at: string;
	comment: string;
};

export type MapPin = {
	id: number;
	inserted_at: string;
	updated_at: string;
	user_id: string;
	lng: number;
	lat: number;
	moderation_status: ModerationStatus;
};

export type MapPinWithModeration = MapPin & { moderation: ModerationInfo[] };

export type UserProfileWithPin = UserProfile & { pin: MapPin | null };

export type HowToDifficulty = 'easy' | 'medium' | 'hard';

export type HowToDuration = 'short' | 'medium' | 'long';

export type HowTo = {
	id: number;
	inserted_at: string;
	updated_at: string;
	user_id: string;
	title: string;
	description: string;
	image: string;
	tags: string[];
	difficulty: HowToDifficulty;
	duration: HowToDuration;
	steps: HowToStep[];
	moderation_status: ModerationStatus;
};

export type HowToWithAuthor = HowTo & { author: UserProfile };

export type HowToWithModeration = HowTo & { moderation: ModerationInfo[] };

type HowToStep = {
	title: string;
	description: string;
	image: string;
};

export type Doc = {
	slug: string;
	title: string;
};

export type DocGroup = {
	slug: string;
	title: string;
	docs: Doc[];
};

export type Event = {
	id: number;
	inserted_at: string;
	updated_at: string;
	user_id: string;
	title: string;
	description: string;
	tags: string[];
	image: string;
	date: string;
	location: string;
	moderation_status: ModerationStatus;
};

export type EventWithAuthor = Event & { author: UserProfile };

export type EventWithModeration = Event & { moderation: ModerationInfo[] };

export type NotificationType =
	| 'howto_pending'
	| 'howto_changes_requested'
	| 'howto_approved'
	| 'howto_rejected'
	| 'event_pending'
	| 'event_changes_requested'
	| 'event_approved'
	| 'event_rejected'
	| 'map_pin_pending'
	| 'map_pin_changes_requested'
	| 'map_pin_approved'
	| 'map_pin_rejected';

export type Notification = {
	id: number;
	inserted_at: string;
	user_id: string;
	type: NotificationType;
	data: Record<string, string>;
	read: boolean;
};
