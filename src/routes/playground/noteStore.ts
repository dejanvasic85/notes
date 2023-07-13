import { writable } from 'svelte/store';
import type { NoteType } from '../../types';

const getFromStorage = () => {
	return typeof localStorage === 'undefined'
		? []
		: JSON.parse(localStorage.getItem('playground') ?? '[]');
};

const setInStorage = (notes: NoteType[]) => {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem('playground', JSON.stringify(notes));
};

export const localNotes = writable<NoteType[]>(getFromStorage());
localNotes.subscribe(setInStorage);
