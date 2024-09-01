<script lang="ts">
	type ComponentEvents = {
		toggleFriend: { id: string };
	};

	import { createEventDispatcher } from 'svelte';
	import type { FriendSelection } from '$lib/types';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { slide } from 'svelte/transition';

	// Events
	const dispatch = createEventDispatcher<ComponentEvents>();

	// Props
	export let friends: FriendSelection[] = [];
	export let isOpen = false;
	export let noteId: string;
</script>

<div class="share-menu relative">
	{#if isOpen}
		<div
			in:slide={{ duration: 100 }}
			class="absolute right-0 top-14 z-50 flex w-80 flex-col gap-1 border-2 p-2 md:w-96 dark:bg-slate-800"
		>
			<a
				class="flex items-center bg-white p-2 hover:ring-2 dark:border-slate-200 dark:bg-slate-800 dark:text-white"
				href={`/my/friends?noteId=${noteId}`}
			>
				<Icon icon="plus" size={30} title="No colour" /> Add friend
			</a>
			{#each friends as { id, name, selected }}
				<button
					class="flex items-center bg-white p-2 hover:ring-2 dark:border-slate-200 dark:bg-slate-800 dark:text-white"
					on:click={() => dispatch('toggleFriend', { id })}
				>
					{#if selected}
						<Icon icon="check" title="Selected" /> &nbsp;
					{:else}
						<Icon icon="cross" title="Not selected" /> &nbsp;
					{/if}
					{name}
				</button>{/each}
		</div>
	{/if}
	<Button variant="ghost" on:click={() => (isOpen = !isOpen)}>
		<Icon icon="personAdd" />
	</Button>
</div>
