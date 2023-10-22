import { derived, writable } from 'svelte/store';

import { getOrderedNotes } from '$lib/notes';
import type { Board } from '$lib/types';

const getFromStorage = () => {
	const data = { notes: [], noteOrder: [] };
	return typeof localStorage === 'undefined'
		? data
		: JSON.parse(localStorage.getItem('playground') ?? JSON.stringify(data));
};

const setInStorage = (board: Board) => {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem('playground', JSON.stringify(board));
};

export const localBoard = writable<Board>(getFromStorage());
localBoard.subscribe(setInStorage);

export const orderedNotes = derived(localBoard, ({ notes, noteOrder }) =>
	getOrderedNotes(noteOrder, notes)
);
