import z from 'zod';

export type { Colour } from '$lib/colours';

export const EntitySchema = z.object({
	id: z.string(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});

export type Entity = z.infer<typeof EntitySchema>;

export const NoteEditorSchema = EntitySchema.extend({
	userId: z.string(),
	noteId: z.string(),
	selected: z.boolean()
});

export type NoteEditor = z.infer<typeof NoteEditorSchema>;

export const NoteEditorInputSchema = z.object({
	id: z.string(),
	userId: z.string(),
	selected: z.boolean()
});

export type NoteEditorInput = z.infer<typeof NoteEditorInputSchema> & { noteId: string };

export const NoteSchema = EntitySchema.extend({
	text: z.string(),
	textPlain: z.string(),
	colour: z.string().nullable(),
	boardId: z.string().nullable(),
	editors: z.array(NoteEditorSchema).optional()
});

export type Note = z.infer<typeof NoteSchema>;

export const NotePatchInputSchema = z.object({
	text: z.string(),
	textPlain: z.string(),
	colour: z.string().nullable()
});

export type NotePatchInput = z.infer<typeof NotePatchInputSchema>;

export const BoardSchema = EntitySchema.extend({
	userId: z.string(),
	notes: z.array(NoteSchema),
	noteOrder: z.array(z.string())
});

export type Board = z.infer<typeof BoardSchema>;

export const BoardPatchSchema = z.object({
	noteOrder: z.array(z.string())
});

export type BoardPatch = z.infer<typeof BoardPatchSchema>;

export const NoteOrderedSchema = NoteSchema.extend({
	order: z.number()
});

export type NoteOrdered = z.infer<typeof NoteOrderedSchema>;

export const UserInviteSchema = EntitySchema.extend({
	friendEmail: z.string(),
	userId: z.string(),
	status: z.string().nullable()
});

export type UserInvite = z.infer<typeof UserInviteSchema>;

export interface UserInviteWithUserProps extends UserInvite {
	user: Pick<User, 'email' | 'name'>;
}

export const UserConnectionSchema = z.object({
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	userFirstId: z.string(),
	userSecondId: z.string(),
	type: z.string()
});

export type UserConnection = z.infer<typeof UserConnectionSchema>;

export const UserSchema = EntitySchema.extend({
	authId: z.string().optional(),
	email: z.string().optional(),
	emailVerified: z.boolean(),
	name: z.string().nullable(),
	picture: z.string().nullable(),
	boards: z.array(BoardSchema),
	connections: z.array(UserConnectionSchema).optional(),
	invites: z.array(UserInviteSchema).optional()
});

export type User = z.infer<typeof UserSchema>;

export type Friend = Pick<User, 'email' | 'id' | 'name' | 'picture'>;

export type FriendSelection = { noteEditorId?: string; selected: boolean } & Friend;

export type SharedNote = Pick<Note, 'id' | 'colour' | 'text' | 'textPlain'> & {
	friendUserId: User['id'];
	friendName: User['name'];
};

export const AuthUserProfileSchema = z.object({
	sub: z.string(),
	nickname: z.string(),
	name: z.string(),
	picture: z.string(),
	updated_at: z.string(),
	email: z.string(),
	email_verified: z.boolean()
});

export type AuthUserProfile = z.infer<typeof AuthUserProfileSchema>;

interface BaseError {
	readonly message: string;
	readonly originalError?: Error | string | unknown;
}

export interface DatabaseError extends BaseError {
	readonly _tag: 'DatabaseError';
}

export interface RecordNotFoundError extends BaseError {
	readonly _tag: 'RecordNotFound';
}

export interface FetchError extends BaseError {
	readonly _tag: 'FetchError';
}

export interface ValidationError extends BaseError {
	readonly _tag: 'ValidationError';
}

export interface SendEmailError extends BaseError {
	readonly _tag: 'SendEmailError';
}

export interface AuthorizationError extends BaseError {
	readonly _tag: 'AuthorizationError';
}

export type ServerError =
	| AuthorizationError
	| DatabaseError
	| RecordNotFoundError
	| FetchError
	| ValidationError
	| SendEmailError;

export type ErrorType = ServerError['_tag'];

export interface ApiError {
	status: 200 | 404 | 403 | 400 | 500;
	message: string;
}

export interface IdParams {
	id: string;
}

export type ToggleFriendShare = {
	id?: string;
	friendUserId: string;
	noteId: string;
	selected: boolean;
};
