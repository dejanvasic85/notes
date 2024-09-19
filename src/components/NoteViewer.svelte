<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { getNoteCssClass } from '$lib/colours';
	import type { SharedNote } from '$lib/types';

	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';

	type ComponentEvents = {
		close: {};
	};

	// Props
	export let noteHtmlText: string;
	export let noteColour: string | null;
	export let showModal: boolean = false;

	// External events
	const dispatch = createEventDispatcher<ComponentEvents>();

	const handleClose = () => {
		dispatch('close', {});
	};

	$: className = getNoteCssClass({
		defaultClass: 'bg-white dark:bg-slate-800 dark:text-white border',
		variant: noteColour ?? ''
	});
</script>

<Modal bind:show={showModal} on:close {className}>
	<div slot="header" class="px-2 pt-2">
		<div class="flex justify-between">
			<div class="flex-1">
				<Button variant="ghost" on:click={handleClose}>
					<Icon icon="chevronLeft" title="Cancel note edit" />
				</Button>
			</div>
		</div>
	</div>

	<div class="h-full w-full p-4 outline-none">
		{@html noteHtmlText}
	</div>
</Modal>
