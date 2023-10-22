import { describe, it, expect } from 'vitest';
import { getOrderedNotes, updateNote, reorderNotes } from './notes';

describe('updateNote', () => {
	it('should update a note in a collection by finding and re-creating the notes', () => {
		const notes = [
			{ id: '1', text: 'one', order: 0, colour: null, boardId: null },
			{ id: '2', text: 'two', order: 1, colour: null, boardId: null },
			{ id: '3', text: 'three', order: 2, colour: null, boardId: null }
		];

		const updatedNotes = updateNote(notes, { id: '2', text: 'updated', order: 1, colour: null, boardId: null });

		expect(updatedNotes).toEqual([
			{ id: '1', text: 'one', order: 0 },
			{ id: '2', text: 'updated', order: 1 },
			{ id: '3', text: 'three', order: 2 }
		]);
	});
});

describe('getOrderedNotes', () => {
	it('should return notes by order specified in order array', () => {
		const notes = [
			{ id: '1', text: 'one', colour: null, boardId: null },
			{ id: '2', text: 'two', colour: null, boardId: null },
			{ id: '3', text: 'three', colour: null, boardId: null }
		];

		const noteOrder = ['2', '3', '1'];

		const orderedNotes = getOrderedNotes(noteOrder, notes);

		expect(orderedNotes).toEqual([
			{ id: '2', text: 'two', order: 0 },
			{ id: '3', text: 'three', order: 1 },
			{ id: '1', text: 'one', order: 2 }
		]);
	});
});

describe('reorderNotes', () => {
	it('should reorder notes', () => {
		const noteOrder = ['1', '2', '3', '4'];
		const reorderedNotes = reorderNotes(noteOrder, 1, 3);
		expect(reorderedNotes).toEqual(['1', '3', '4', '2']);
	});
});
