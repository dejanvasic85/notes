<script lang="ts">
	import { onMount } from 'svelte';

	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import Board from '$components/Board.svelte';
	import Button from '$components/Button.svelte';
	import Icon from '$components/Icon.svelte';
	import Footer from '$components/Footer.svelte';
	import LinkButton from '$components/LinkButton.svelte';
	import logo from '$lib/images/notes-main.png';
	import type { Note, NoteOrdered } from '$lib/types';
	import { getBoardState } from '$lib/state/boardState.svelte';

	let { data } = $props();
	const boardState = getBoardState();

	onMount(() => {
		boardState.reset();
		boardState.createNewNote('<p>Click here to edit me! You can also drag to reorder 😊</p>');
	});

	function handleCreateNote() {
		const newNote = boardState.createNewNote();
		goto(`/?id=${newNote.id}`);
	}

	function handleUpdateNote({ note }: { note: NoteOrdered }) {
		boardState.updateNote(note);
	}

	function handleDeleteNote({ note }: { note: Note }) {
		boardState.deleteNoteById(note.id);
		handleClose();
	}

	function handleClose() {
		goto('/');
	}

	function handleSelect({ id }: { id: string }) {
		goto(`/?id=${id}`);
	}

	function handleReorder({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }) {
		boardState.reorderNotes(fromIndex, toIndex);
	}

	let search = $derived(new URL(page.url).searchParams);
	let selectedId = $derived(search.get('id'));
	let selectedNote = $derived(boardState.notes.find((n) => n.id === selectedId));
</script>

<svelte:head>
	<title>My Notes - personal note taking application</title>
	<meta name="description" content="A simple note taking application." />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<main>
		<header
			class="h-20 border-b px-4 py-2 md:container md:mx-auto dark:border-b-darkBorder dark:bg-dark"
		>
			<nav class="flex h-full w-full items-center justify-between">
				<img src={logo} alt="Notes" class="size-14" />
				<div>
					<a
						href="https://github.com/dejanvasic85/notes"
						target="_blank"
						class="inline-block size-5"
						aria-label="Github repository"
					>
						<svg x="0px" y="0px" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
								fill="currentColor"
							>
							</path>
						</svg>
					</a>
				</div>
			</nav>
		</header>

		<section class="container mx-auto px-20">
			<div
				class="flex flex-col items-center justify-between gap-14 rounded-xl pt-14 sm:pt-24 lg:flex-row lg:pt-32"
			>
				<h1 class="text-6xl md:text-7xl">
					Take Notes
					<span class="block font-bold text-primary">Privately</span>
				</h1>

				<div class="flex flex-col gap-8">
					<p class="text-lg md:text-xl">
						Your Notes, Your <span class="border-b-2 border-secondary pb-1 font-semibold">Data</span
						>, Your
						<span class="border-b-2 border-tertiary pb-1 font-bold">Peace of Mind</span>.
					</p>

					<div class="flex flex-col justify-end gap-2 md:flex-row">
						{#if data.isAuthenticated}
							<LinkButton variant="tertiary" href="/my/board">
								<Icon icon="arrow-right-circle" fill="none" />
								<span>Go to board</span>
							</LinkButton>
							<LinkButton variant="ghost" href="/api/auth/logout">
								<Icon icon="logout" fill="none" />
								<span>Logout</span>
							</LinkButton>
						{:else}
							<LinkButton href="/api/auth/login?returnUrl=/my/board&signup=true" variant="tertiary"
								>Sign up</LinkButton
							>
							<LinkButton href="/api/auth/login?returnUrl=/my/board" variant="secondary"
								>Login</LinkButton
							>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<div class="container mx-auto mt-24 flex flex-col gap-6 px-8 py-12">
			<div>
				<Button variant="primary" onclick={handleCreateNote}>
					<Icon icon="plus-circle" fill="none" />
					<span>Create a note</span>
				</Button>
			</div>
			<Board
				notes={boardState.notes}
				{selectedNote}
				selectedSharedNote={null}
				onclosenote={handleClose}
				ondeletenote={handleDeleteNote}
				onreorder={handleReorder}
				onselect={handleSelect}
				onupdatenote={handleUpdateNote}
			/>
		</div>
	</main>
	<Footer />
</div>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
