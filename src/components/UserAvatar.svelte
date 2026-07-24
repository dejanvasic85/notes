<script lang="ts">
	import { Avatar, Tooltip } from 'bits-ui';

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

	const imageClass = $derived(`m-0 rounded-full ring-2 ring-white ${sizeMap[size]}`);
	const fallbackClass = $derived(
		`bg-secondary m-0 flex items-center justify-center rounded-full text-xs font-medium text-white ring-2 ring-white ${sizeMap[size]}`
	);
	const initials = $derived(getInitials(name));
</script>

{#snippet avatarImage(triggerProps?: Record<string, unknown>)}
	<Avatar.Root {...triggerProps} class="inline-flex {sizeMap[size]}">
		<Avatar.Image src={picture} alt={`Avatar of ${name}`} class={imageClass} />
		<Avatar.Fallback class={fallbackClass}>{initials}</Avatar.Fallback>
	</Avatar.Root>
{/snippet}

{#if showTooltip}
	<Tooltip.Root delayDuration={0} disableCloseOnTriggerClick>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				{@render avatarImage(props)}
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content sideOffset={8} side="top" class="z-toaster rounded-lg bg-black shadow-sm">
			<Tooltip.Arrow />
			<p class="p-4 text-sm text-white">{tooltip}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	{@render avatarImage()}
{/if}
