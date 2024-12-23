<script lang="ts">
	import { fly } from 'svelte/transition';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';

	import Icon from './Icon.svelte';

	type Props = {
		userPicture: string;
	};

	let { userPicture }: Props = $props();

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
		class="menu flex w-32 flex-col justify-between rounded-lg border bg-white dark:border-darkBorder dark:bg-dark"
		use:melt={$menu}
		transition:fly={{ duration: 150, y: -10 }}
	>
		<a
			class="hover:bg-slate flex w-full gap-2 rounded-lg p-2 hover:bg-background dark:hover:bg-darkHover"
			href="/api/auth/logout"
			use:melt={$item}
		>
			<Icon icon="arrow-left-start-on-rectangle" fill="none" size={24} />
			<span>Logout</span>
		</a>
	</div>
{/if}
