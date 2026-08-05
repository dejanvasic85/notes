import type { CreateNoteInput } from '$lib/types';

interface QueuedMutationBase {
	id: string;
	// Client Date.now() at enqueue time - FIFO replay order. Distinct from the
	// per-field-group timestamps below, which are what the server compares
	// against a concurrent edit for last-write-wins.
	queuedAt: number;
}

export type QueuedMutation =
	| (QueuedMutationBase & { type: 'create'; note: CreateNoteInput })
	| (QueuedMutationBase & {
			type: 'update-content';
			noteId: string;
			text: string;
			textPlain: string;
			title: string | null;
			contentUpdatedAt: number;
	  })
	| (QueuedMutationBase & {
			type: 'update-colour';
			noteId: string;
			colour: string | null;
			colourUpdatedAt: number;
	  })
	| (QueuedMutationBase & { type: 'delete'; noteId: string })
	| (QueuedMutationBase & { type: 'reorder'; boardId: string; noteOrder: string[] });

// The note a mutation targets, for pause-on-failure grouping - reorders are
// board-wide rather than note-scoped, so they never pause on a note failure.
export function targetNoteId(mutation: QueuedMutation): string | null {
	switch (mutation.type) {
		case 'reorder':
			return null;
		case 'create':
			return mutation.note.id;
		default:
			return mutation.noteId;
	}
}
