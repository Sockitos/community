import type { MergeDeep } from 'type-fest';
import type { Database as DatabaseGenerated } from './supabase-types.gen.ts';

type Step = { title: string; description: string; image: string };

export type Database = MergeDeep<
	DatabaseGenerated,
	{
		public: {
			Tables: {
				howtos: {
					Row: {
						steps: Step[];
					};
					Insert: {
						steps: Step[];
					};
					Update: {
						steps?: Step[];
					};
				};
			};
			Views: {
				events_view: {
					Row: {
						date: string;
						description: string;
						id: number;
						image: string;
						inserted_at: string;
						location: string;
						tags: string[];
						title: string;
						updated_at: string;
						user_id: string;
					};
				};
				events_tags: {
					Row: {
						count: number;
						tag: string;
					};
				};
				howtos_view: {
					Row: {
						description: string;
						difficulty: Database['public']['Enums']['how_to_difficulty'];
						duration: Database['public']['Enums']['how_to_duration'];
						id: number;
						image: string;
						inserted_at: string;
						steps: Step[];
						tags: string[];
						title: string;
						updated_at: string;
						user_id: string;
					};
				};
				howtos_tags: {
					Row: {
						count: number;
						tag: string;
					};
				};
				latest_events_moderation: {
					Row: {
						comment: string;
						event_id: number;
						id: number;
						inserted_at: string;
						status: Database['public']['Enums']['moderation_status'];
						user_id: string;
					};
				};
				latest_howtos_moderation: {
					Row: {
						comment: string;
						howto_id: number;
						id: number;
						inserted_at: string;
						status: Database['public']['Enums']['moderation_status'];
						user_id: string;
					};
				};
				latest_map_pins_moderation: {
					Row: {
						comment: string;
						id: number;
						inserted_at: string;
						map_pin_id: number;
						status: Database['public']['Enums']['moderation_status'];
						user_id: string;
					};
				};
				map_pins_view: {
					Row: {
						id: number;
						inserted_at: string;
						lat: number;
						lng: number;
						moderation_status: Database['public']['Enums']['moderation_status'];
						updated_at: string;
						user_id: string;
					};
				};
				profiles_view: {
					Row: {
						description: string;
						display_name: string;
						email: string;
						id: string;
						inserted_at: string;
						role: Database['public']['Enums']['user_role'];
						type: string;
						updated_at: string;
					};
				};
			};
		};
	}
>;
