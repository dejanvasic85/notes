import { writable } from 'svelte/store';
import type { Note } from '../../types';

const getFromStorage = () => {
	return typeof localStorage === 'undefined'
		? []
		: JSON.parse(localStorage.getItem('playground') ?? '[]');
};

const setInStorage = (notes: Note[]) => {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem('playground', JSON.stringify(notes));
};

export const localNotes = writable<Note[]>(getFromStorage());
localNotes.subscribe(setInStorage);
