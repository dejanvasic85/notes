<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { LucideIcon } from '@lucide/svelte';

	import { durationBaseMs, durationFastMs, easeEnter, easeExit } from '$lib/motion';
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
	class="h-friend flex w-full items-center justify-between gap-2 p-4"
	role="listitem"
	in:fade={{ duration: durationBaseMs, easing: easeEnter }}
	out:slide={{ duration: durationFastMs, easing: easeExit }}
>
	<div class="flex items-center gap-2">
		{#if picture}
			<UserAvatar {picture} {name} size={8} showTooltip={false} />
		{/if}

		<div class:italic={showPending} class:text-ink-faint={showPending}>
			{name}
			{#if showPending}
				<span class="text-ink-faint text-xs italic">(pending)</span>
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
