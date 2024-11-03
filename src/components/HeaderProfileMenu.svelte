<script lang="ts">
	import { fly } from 'svelte/transition';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

	import Icon from './Icon.svelte';

	export let userPicture: string;

	const {
		elements: { trigger, menu, item },
		states: { open }
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
		preventScroll: true,
		closeOnOutsideClick: true,
		positioning: { placement: 'bottom-end' }
	});
</script>

<button type="button" use:melt={$trigger} aria-label="user menu">
	<img src={userPicture} alt="User" class="size-8 rounded-full" />
</button>

{#if $open}
	<div
		class="menu mt-2 flex flex-col justify-between rounded-md border bg-background dark:bg-dark"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -10 }}
	>
		<a
			class="hover:bg-slate flex w-full gap-2 p-2 hover:bg-tertiary"
			href="/my/friends"
			use:melt={$item}
		>
			<Icon icon="check" />
			<span>Friends</span>
		</a>
		<a class="flex w-full gap-2 p-2" href="/api/auth/logout" use:melt={$item}>
			<Icon icon="logout" />
			<span>Logout</span>
		</a>
	</div>
{/if}
