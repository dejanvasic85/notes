<script lang="ts">
	import type { FriendSelection } from '$lib/types';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { UserPlus, CirclePlus, Check, Minus } from '@lucide/svelte';

	import Button from './Button.svelte';
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
	<Button variant="ghost" label="Manage sharing">
		<UserPlus />
	</Button>
</div>
{#if $open}
	<!-- pointer-events-auto: when this opens from within Dialog.svelte (bits-ui), the dialog's
		scroll lock sets pointer-events: none on <body>; this menu is portalled outside the
		dialog's own DOM subtree, so it needs to opt back in explicitly to stay clickable. -->
	<div
		use:melt={$menu}
		in:slide={{ duration: 100 }}
		class="z-dropdown dark:bg-dark pointer-events-auto flex w-96 flex-col gap-1 rounded-lg border bg-white p-2 shadow-lg"
	>
		<a
			class="dark:bg-dark flex items-center rounded-lg bg-white p-2 hover:ring-2"
			href={`/my/friends/add?noteId=${noteId}`}
			use:melt={$item}
		>
			<CirclePlus size={30} /> &nbsp; Invite friend
		</a>
		{#each friends as { id, noteEditorId, name, selected }}
			<button
				class="dark:bg-dark flex items-center rounded-lg bg-white p-2 hover:ring-2"
				aria-label={selected ? `${name}, selected` : `${name}, not selected`}
				onclick={() => ontogglefriend({ id: noteEditorId, friendUserId: id, selected: !selected })}
				use:melt={$item}
			>
				{#if selected}
					<Check /> &nbsp;
				{:else}
					<Minus /> &nbsp;
				{/if}
				{name}
			</button>{/each}
	</div>
{/if}
