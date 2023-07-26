import type { Colour } from '$lib/colours';

export interface NoteType {
	id: string;
	sequence: number;
	text: string;
	colour?: Colour;
}
