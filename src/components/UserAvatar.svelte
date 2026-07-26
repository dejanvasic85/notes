<script lang="ts">
	import { Tooltip } from 'bits-ui';

	type Props = {
		picture: string;
		name: string;
		size?: 5 | 6 | 7 | 8;
		tooltip?: string;
		showTooltip?: boolean;
	};

	const { picture, name, size = 5, tooltip = name, showTooltip = true }: Props = $props();

	const sizeMap = {
		5: 'size-5',
		6: 'size-6',
		7: 'size-7',
		8: 'size-8'
	};

	function getInitials(fullName: string): string {
		return fullName
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? '')
			.join('');
	}

	const imageClass = $derived(`ring-paper m-0 rounded-full ring-2 ${sizeMap[size]}`);
	const fallbackClass = $derived(
		`bg-accent text-on-accent ring-paper m-0 flex items-center justify-center rounded-full text-xs font-medium ring-2 ${sizeMap[size]}`
	);
	const initials = $derived(getInitials(name));

	// Tracks the src that failed rather than a boolean, so a new picture is
	// retried instead of staying stuck on the fallback.
	let failedSrc = $state<string | null>(null);
	const showFallback = $derived(!picture || failedSrc === picture);

	function handleImageError() {
		failedSrc = picture;
	}
</script>

{#snippet avatarImage(triggerProps?: Record<string, unknown>)}
	<span {...triggerProps} class="inline-flex {sizeMap[size]}">
		{#if showFallback}
			<span class={fallbackClass} aria-label={`Avatar of ${name}`} role="img">{initials}</span>
		{:else}
			<img src={picture} alt={`Avatar of ${name}`} class={imageClass} onerror={handleImageError} />
		{/if}
	</span>
{/snippet}

{#if showTooltip}
	<Tooltip.Root delayDuration={0} disableCloseOnTriggerClick>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				{@render avatarImage(props)}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content
			sideOffset={8}
			side="top"
			class="z-toaster rounded-control bg-ink shadow-lifted"
		>
			<Tooltip.Arrow />
			<p class="text-canvas p-4 text-sm">{tooltip}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	{@render avatarImage()}
{/if}
