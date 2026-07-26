<script lang="ts">
	import { slide } from 'svelte/transition';
	import { DropdownMenu } from 'bits-ui';

	import { colours, type Colour } from '$lib/colours';
	import { Paintbrush, Minus } from '@lucide/svelte';

	import Button from './Button.svelte';

	type Props = {
		onselect: (colour: Colour | null) => void;
	};

	let { onselect }: Props = $props();

	function handleColourClick(colour: Colour | null) {
		onselect(colour);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<div {...props}>
				<Button variant="ghost" label="Choose colour">
					<Paintbrush />
				</Button>
			</div>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Portal>
		<DropdownMenu.Content forceMount loop side="bottom">
			{#snippet child({ props, open, wrapperProps })}
				{#if open}
					<div {...wrapperProps}>
						<div
							{...props}
							class="z-dropdown flex flex-col gap-1 bg-transparent"
							in:slide={{ duration: 100 }}
						>
							<DropdownMenu.Item onSelect={() => handleColourClick(null)}>
								<button
									aria-label="No colour"
									class="border-line bg-paper text-ink-muted flex h-12 w-12 items-center justify-center rounded-full border-2"
									tabindex={-1}
								>
									<Minus size={30} />
								</button>
							</DropdownMenu.Item>
							{#each colours as { cssClass, name } (name)}
								<DropdownMenu.Item onSelect={() => handleColourClick(name)}>
									<button
										aria-label={name}
										title={name}
										class="border-line h-12 w-12 rounded-full border-2 dark:border {cssClass}"
										tabindex={-1}
									></button>
								</DropdownMenu.Item>
							{/each}
						</div>
					</div>
				{/if}
			{/snippet}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
