import type { CreateNoteInput } from '$lib/types';

interface QueuedMutationBase {
	id: string;
	// FIFO replay order - distinct from the per-field-group timestamps below.
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

// null for reorder - it's board-wide, not note-scoped.
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
