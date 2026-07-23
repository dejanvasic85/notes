<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { LucideIcon } from '@lucide/svelte';

	import Button from './Button.svelte';
	import UserAvatar from './UserAvatar.svelte';

	type Action = {
		id: string;
		label: string;
		icon: LucideIcon;
		onclick: (id: string) => void;
	};

	type Props = {
		name: string;
		picture?: string | null;
		showPending: boolean;
		actions?: Action[];
	};

	let { name, picture, showPending, actions }: Props = $props();
</script>

<div
	class="h-friend dark:bg-dark flex w-full items-center justify-between gap-2 p-4"
	role="listitem"
	in:fade
	out:slide={{ duration: 250 }}
>
	<div class="flex items-center gap-2">
		{#if picture}
			<UserAvatar {picture} {name} size={8} showTooltip={false} />
		{/if}

		<div class:italic={showPending} class:text-gray-400={showPending}>
			{name}
			{#if showPending}
				<span class="text-xs text-gray-400 italic">(pending)</span>
			{/if}
		</div>
	</div>

	<div class="flex gap-1">
		{#if actions}
			{#each actions as action}
				{@const ActionIcon = action.icon}
				<Button
					variant="ghost"
					label={action.label}
					onclick={() => action.onclick(action.id)}
					tooltip={action.label}
				>
					<ActionIcon />
				</Button>
			{/each}
		{/if}
	</div>
</div>
