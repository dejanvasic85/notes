import type { Colour } from '$lib/colours';

export interface Note {
	id: string;
	text: string;
	colour?: Colour;
}
