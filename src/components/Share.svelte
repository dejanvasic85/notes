<script lang="ts">
	import type { FriendSelection } from '$lib/types';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import { slide } from 'svelte/transition';

	type ToggleFriendEvent = {
		id?: string;
		friendUserId: string;
		selected: boolean;
	};

	type Props = {
		friends: FriendSelection[];
		noteId: string;
		ontogglefriend: (event: ToggleFriendEvent) => void;
	};

	let { friends, noteId, ontogglefriend }: Props = $props();

	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		closeOnItemClick: false,
		forceVisible: true,
		loop: true,
		preventScroll: true,
		positioning: { placement: 'bottom' },
		onOutsideClick: () => {
			$open = false;
		}
	});
</script>

<div use:melt={$trigger}>
	<Button variant="ghost">
		<Icon icon="user-plus" fill="none" />
	</Button>
</div>
{#if $open}
	<div
		use:melt={$menu}
		in:slide={{ duration: 100 }}
		class="flex w-80 flex-col gap-1 rounded-lg border bg-white p-2 md:w-96 dark:bg-dark"
	>
		<a
			class="flex items-center rounded-lg bg-white p-2 hover:ring-2 dark:bg-dark"
			href={`/my/friends?noteId=${noteId}`}
			use:melt={$item}
		>
			<Icon icon="plus-circle" size={30} title="No colour" fill="none" /> &nbsp; Add friend
		</a>
		{#each friends as { id, noteEditorId, name, selected }}
			<button
				class="flex items-center rounded-lg bg-white p-2 hover:ring-2 dark:bg-dark"
				onclick={() => ontogglefriend({ id: noteEditorId, friendUserId: id, selected: !selected })}
				use:melt={$item}
			>
				{#if selected}
					<Icon icon="check" title="Selected" fill="none" /> &nbsp;
				{:else}
					<Icon icon="minus" title="Not selected" fill="none" /> &nbsp;
				{/if}
				{name}
			</button>{/each}
	</div>
{/if}
