import type { Colour } from '$lib/colours';

export interface Note {
	id: string;
	sequence: number;
	text: string;
	colour?: Colour;
}
