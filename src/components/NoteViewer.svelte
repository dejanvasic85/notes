<script lang="ts">
	import Button from './Button.svelte';
	import Icon from './Icon.svelte';
	import Dialog from './Dialog.svelte';

	type Props = {
		noteHtmlText: string;
		noteColour: string | null;
		onclose: () => void;
	};

	let { noteHtmlText, noteColour, onclose }: Props = $props();

	const handleClose = () => {
		onclose();
	};

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Dialog show={true} colour={noteColour}>
	{#snippet header()}
		<div class="px-2 pt-2">
			<div class="flex justify-between">
				<div class="flex-1">
					<Button variant="ghost" onclick={handleClose}>
						<Icon icon="arrow-left" title="Cancel note edit" />
					</Button>
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet body()}
		<div class="h-full w-full p-4 outline-none">
			{@html noteHtmlText}
		</div>
	{/snippet}
</Dialog>
