import type { Colour } from '$lib/colours';

interface Entity {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface User extends Entity {
	authId?: string;
	email?: string | undefined;
	emailVerified: boolean;
	name: string | null;
	picture: string | null;
	boards: Board[];
}

export interface AuthUserProfile {
	sub: string;
	nickname: string;
	name: string;
	picture: string;
	updated_at: string;
	email: string;
	email_verified: boolean;
}

export interface Note extends Entity {
	text: string;
	textPlain: string;
	colour?: Colour | null;
	boardId: string | null;
}

export interface NoteOrdered extends Note {
	order: number;
}

export interface NoteCreateParams extends Pick<Note, 'boardId' | 'colour' | 'text' | 'textPlain'> {
	id: string;
}

export interface Board extends Entity {
	userId: string;
	notes: Note[];
	noteOrder: string[];
}
