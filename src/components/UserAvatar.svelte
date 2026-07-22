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

	const imageClass = $derived(`m-0 rounded-full ring-2 ring-white ${sizeMap[size]}`);
</script>

{#snippet avatarImage(triggerProps?: Record<string, unknown>)}
	<Avatar.Root>
		<Avatar.Image {...triggerProps} src={picture} alt={`Avatar of ${name}`} class={imageClass} />
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
