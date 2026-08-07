import { describe, expect, it } from 'vitest';

import { coalesceReorders, coalesceUpdateContent, nextDrainBatch } from './writeQueue';
import type { QueuedMutation } from './writeQueueTypes';

function reorder(id: string, boardId: string, queuedAt: number): QueuedMutation {
	return { id, type: 'reorder', boardId, noteOrder: [], queuedAt };
}

function updateContent(id: string, noteId: string, queuedAt: number): QueuedMutation {
	return {
		id,
		type: 'update-content',
		noteId,
		text: '',
		textPlain: '',
		title: null,
		contentUpdatedAt: queuedAt,
		queuedAt
	};
}

function createNote(id: string, noteId: string, queuedAt: number): QueuedMutation {
	return {
		id,
		type: 'create',
		note: { id: noteId, text: '', textPlain: '', colour: null },
		queuedAt
	};
}

describe('coalesceReorders', () => {
	it('keeps only the latest queued reorder per board', () => {
		const items = [reorder('r1', 'bid_1', 1), reorder('r2', 'bid_1', 2), reorder('r3', 'bid_1', 3)];

		expect(coalesceReorders(items)).toEqual([items[2]]);
	});

	it('keeps the latest reorder per board independently across boards', () => {
		const items = [reorder('r1', 'bid_1', 1), reorder('r2', 'bid_2', 1), reorder('r3', 'bid_1', 2)];

		expect(coalesceReorders(items)).toEqual([items[1], items[2]]);
	});

	it('leaves non-reorder items untouched and in order', () => {
		const items = [
			updateContent('u1', 'nid_1', 1),
			reorder('r1', 'bid_1', 2),
			reorder('r2', 'bid_1', 3)
		];

		expect(coalesceReorders(items)).toEqual([items[0], items[2]]);
	});
});

describe('coalesceUpdateContent', () => {
	it('keeps only the latest queued content edit per note', () => {
		const items = [
			updateContent('u1', 'nid_1', 1),
			updateContent('u2', 'nid_1', 2),
			updateContent('u3', 'nid_1', 3)
		];

		expect(coalesceUpdateContent(items)).toEqual([items[2]]);
	});

	it('keeps the latest edit per note independently across notes', () => {
		const items = [
			updateContent('u1', 'nid_1', 1),
			updateContent('u2', 'nid_2', 1),
			updateContent('u3', 'nid_1', 2)
		];

		expect(coalesceUpdateContent(items)).toEqual([items[1], items[2]]);
	});

	it('leaves non-content items untouched and in order', () => {
		const items = [
			reorder('r1', 'bid_1', 1),
			updateContent('u1', 'nid_1', 2),
			updateContent('u2', 'nid_1', 3)
		];

		expect(coalesceUpdateContent(items)).toEqual([items[0], items[2]]);
	});
});

describe('nextDrainBatch', () => {
	it('returns every item when nothing is paused', () => {
		const items = [updateContent('u1', 'nid_1', 1), createNote('c1', 'nid_2', 2)];

		expect(nextDrainBatch(items, new Set())).toEqual(items);
	});

	it('excludes further items for a paused note', () => {
		const items = [
			updateContent('u1', 'nid_1', 1),
			updateContent('u2', 'nid_1', 2),
			updateContent('u3', 'nid_2', 3)
		];

		expect(nextDrainBatch(items, new Set(['nid_1']))).toEqual([items[2]]);
	});

	it('never excludes reorders, since they are not note-scoped', () => {
		const items = [reorder('r1', 'bid_1', 1)];

		expect(nextDrainBatch(items, new Set(['nid_1']))).toEqual(items);
	});
});
