<script lang="ts">
	import { onMount } from 'svelte';

	import partition from 'lodash/partition';

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	import LinkButton from '$components/LinkButton.svelte';
	import Board from '$components/Board.svelte';

	import logo from '$lib/images/notes-main.png';
	import github from '$lib/images/github.svg';
	import { generateId } from '$lib/identityGenerator';

	import { reorderNotes } from '$lib/notes';
	import type { Note } from '$lib/types';

	import { localBoard, orderedNotes } from '$lib/noteStore';

	onMount(() => {
		const id = generateId('nid');
		localBoard.update(() => ({
			id: generateId('bid'),
			userId: '',
			noteOrder: [id],
			notes: [
				{
					id,
					text: 'Use the force and edit me by clicking here.',
					textPlain: 'Use the force and edit me by clicking here.',
					boardId: $localBoard.id!,
					colour: 'blue'
				}
			]
		}));
	});

	function handleCreateNote() {
		const id = generateId('nid');
		localBoard.update((current) => {
			return {
				...current,
				noteOrder: [...current.noteOrder, id],
				notes: [
					...current.notes,
					{ id, text: `New note`, textPlain: `New note`, boardId: $localBoard.id!, colour: null }
				]
			};
		});

		goto(`/?id=${id}`);
	}

	function handleUpdateNote({ detail: { note } }: CustomEvent<{ note: Note }>) {
		localBoard.update((state) => {
			const [[noteToUpdate], rest] = partition(state.notes, (n) => n.id === note.id);
			console.log('noteToUpdate', noteToUpdate, state);
			return {
				...state,
				noteOrder: [...state.noteOrder],
				notes: [...rest, { ...note }]
			};
		});
	}

	function handleDeleteNote({ detail }: CustomEvent<{ note: Note }>) {
		localBoard.update((state) => {
			return {
				...state,
				noteOrder: [...state.noteOrder.filter((id) => id !== detail.note.id)],
				notes: [...state.notes.filter((n) => n.id !== detail.note.id)]
			};
		});
		handleClose();
	}

	function handleClose() {
		goto('/');
	}

	function handleSelect({ detail: { id } }: CustomEvent<{ id: string }>) {
		goto(`/?id=${id}`);
	}

	function handleReorder({
		detail: { fromIndex, toIndex }
	}: CustomEvent<{ fromIndex: number; toIndex: number }>) {
		localBoard.update((state) => {
			const newOrder = reorderNotes(state.noteOrder, fromIndex, toIndex);
			return {
				...state,
				noteOrder: newOrder
			};
		});
	}

	$: search = new URL($page.url).searchParams;
	$: selectedId = search.get('id');
	$: selectedNote = $orderedNotes.find((n) => n.id === selectedId);
</script>

<svelte:head>
	<title>My Notes - personal note taking application</title>
	<meta name="description" content="A simple note taking application." />
</svelte:head>

<header class="borderpx-6 container mx-auto h-20 border-b-2">
	<nav class="flex w-full items-center justify-between">
		<img src={logo} alt="Notes" class="size-20" />
		<div>
			<a href="https://github.com/dejanvasic85/notes" target="_blank">
				<img src={github} alt="Github" class="inline-block size-5" />
			</a>
		</div>
	</nav>
</header>

<section class="flex flex-col items-center justify-center gap-8 rounded-xl pt-20 sm:pt-24 lg:pt-32">
	<h1 class="text-6xl md:text-8xl">
		Take Notes
		<span class="block font-bold text-primary">Privately</span>
	</h1>

	<p class="text-lg md:text-xl">
		Your Notes, Your <span class="border-b-2 border-secondary pb-1 font-semibold">Data</span>, Your
		<span class="border-b-2 border-tertiary pb-1 font-bold">Peace of Mind</span>.
	</p>

	<div class="flex gap-2">
		<LinkButton href="/api/auth/login?screen_hint=register" variant="tertiary"
			>Get started</LinkButton
		>
		<LinkButton href="/api/auth/login" variant="secondary">Login</LinkButton>
	</div>

	<p class="text-center italic">Easily create notes and share them with your family and friends.</p>
</section>

<div class="mt-8">
	<Board
		notes={$orderedNotes}
		{selectedNote}
		selectedSharedNote={null}
		on:createNote={handleCreateNote}
		on:closeNote={handleClose}
		on:deleteNote={handleDeleteNote}
		on:reorder={handleReorder}
		on:select={handleSelect}
		on:updateNote={handleUpdateNote}
	/>
</div>
