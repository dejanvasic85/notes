import { describe, it, expect } from 'vitest';
import { getOrderedNotes, updateNote, reorderNotes, searchNotes } from './notes';

describe('updateNote', () => {
	it('should update a note in a collection by finding and re-creating the notes', () => {
		const notes = [
			{ id: '1', text: 'one', textPlain: 'one', colour: null, boardId: null },
			{ id: '2', text: 'two', textPlain: 'two', colour: null, boardId: null },
			{ id: '3', text: 'three', textPlain: 'three', colour: null, boardId: null }
		];

		const updatedNotes = updateNote(notes, {
			id: '2',
			text: 'updated',
			textPlain: 'updated',
			colour: null,
			boardId: null
		});

		expect(updatedNotes).toEqual([
			{ id: '1', colour: null, text: 'one', textPlain: 'one', boardId: null },
			{ id: '2', colour: null, text: 'updated', textPlain: 'updated', boardId: null },
			{ id: '3', colour: null, text: 'three', textPlain: 'three', boardId: null }
		]);
	});
});

describe('getOrderedNotes', () => {
	it('should return notes by order specified in order array', () => {
		const notes = [
			{ id: '1', text: 'one', textPlain: 'one', colour: null, boardId: null },
			{ id: '2', text: 'two', textPlain: 'two', colour: null, boardId: null },
			{ id: '3', text: 'three', textPlain: 'three', colour: null, boardId: null }
		];

		const noteOrder = ['2', '3', '1'];

		const orderedNotes = getOrderedNotes(noteOrder, notes);

		expect(orderedNotes).toEqual([
			{ id: '2', text: 'two', textPlain: 'two', order: 0, colour: null, boardId: null },
			{ id: '3', text: 'three', textPlain: 'three', order: 1, colour: null, boardId: null },
			{ id: '1', text: 'one', textPlain: 'one', order: 2, colour: null, boardId: null }
		]);
	});
});

describe('reorderNotes', () => {
	it('should reorder notes', () => {
		const noteOrder = ['1', '2', '3', '4'];
		const reorderedNotes = reorderNotes(noteOrder, 1, 3);
		expect(reorderedNotes).toEqual(['1', '3', '4', '2'])
	});
});

describe('searchNotes', () => {
	it('should filter notes by query ', () => {
		const notes = [
			{ id: '1', text: 'one', textPlain: 'hello world', colour: null, boardId: null },
			{ id: '2', text: 'two', textPlain: 'lorem ipsum', colour: null, boardId: null },
			{ id: '3', text: 'three', textPlain: 'hello sweet action', colour: null, boardId: null }
		];

		const filteredNotes = searchNotes(notes, 'hello');

		expect(filteredNotes).toEqual([
			{ id: '1', text: 'one', textPlain: 'hello world', colour: null, boardId: null },
			{ id: '3', text: 'three', textPlain: 'hello sweet action', colour: null, boardId: null }
		]);
	})

	it('should return empty array if no notes match query', () => {
		const notes = [
			{ id: '1', text: 'one', textPlain: 'hello world', colour: null, boardId: null },
			{ id: '2', text: 'two', textPlain: 'lorem ipsum', colour: null, boardId: null },
			{ id: '3', text: 'three', textPlain: 'hello sweet action', colour: null, boardId: null }
		];

		const filteredNotes = searchNotes(notes, 'goodbye');

		expect(filteredNotes).toEqual([]);
	})

	it('should return all notes if query is empty', () => {
		const notes = [
			{ id: '1', text: 'one', textPlain: 'hello world', colour: null, boardId: null },
			{ id: '2', text: 'two', textPlain: 'lorem ipsum', colour: null, boardId: null },
			{ id: '3', text: 'three', textPlain: 'hello sweet action', colour: null, boardId: null }
		];

		const filteredNotes = searchNotes(notes, '');

		expect(filteredNotes).toEqual(notes);
	});
});
