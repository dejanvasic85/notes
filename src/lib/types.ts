import z from 'zod';

export type { Colour } from '$lib/colours';

export const EntitySchema = z.object({
	id: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});

export type Entity = z.infer<typeof EntitySchema>;

export const NoteSchema = EntitySchema.extend({
	text: z.string(),
	textPlain: z.string(),
	colour: z.string().nullable(),
	boardId: z.string().nullable()
});

export type Note = z.infer<typeof NoteSchema>;

export const BoardSchema = EntitySchema.extend({
	userId: z.string(),
	notes: z.array(NoteSchema),
	noteOrder: z.array(z.string())
});

export type Board = z.infer<typeof BoardSchema>;

export const NoteOrderedSchema = NoteSchema.extend({
	order: z.number()
});

export type NoteOrdered = z.infer<typeof NoteOrderedSchema>;

export const UserSchema = EntitySchema.extend({
	authId: z.string().optional(),
	email: z.string().optional(),
	emailVerified: z.boolean(),
	name: z.string().nullable(),
	picture: z.string().nullable(),
	boards: z.array(BoardSchema)
});

export type User = z.infer<typeof UserSchema>;

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

export const NoteCreateInputSchema = z.object({
	id: z.string(),
	boardId: z.string(),
	colour: z.string().nullable(),
	text: z.string(),
	textPlain: z.string()
});

export type NoteCreateInput = z.infer<typeof NoteCreateInputSchema>;
