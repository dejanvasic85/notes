// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { User } from '$lib/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User;
		}
		//interface PageData {}
		// interface Platform {}
		interface PageState {
			selectedNoteId: string | null;
		}
	}
}

export {};
