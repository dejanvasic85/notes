import type { Colour } from '$lib/colours';

export interface Note {
	id: string;
	text: string;
	colour?: Colour;
}

export interface NoteOrdered extends Note {
	order: number;
}

export interface Board {
	notes: Note[];
	noteOrder: string[];
}
