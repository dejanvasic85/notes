<script lang="ts">
	import { Share, SquarePlus, X } from '@lucide/svelte';

	import Button from './Button.svelte';
	import Dialog from './Dialog.svelte';

	type Props = {
		show: boolean;
	};

	let { show = $bindable(false) }: Props = $props();

	const iconSize = 20;

	function handleClose() {
		show = false;
	}
</script>

<Dialog bind:show>
	{#snippet header()}
		<!-- Dialog intentionally supplies no padding or close control; both are the
		     consumer's job, and this sheet ignores escape and outside clicks. -->
		<div class="flex items-center justify-between px-4 pt-4">
			<h2 class="text-heading">Install My Notes</h2>
			<Button variant="ghost" onclick={handleClose} label="Close install instructions">
				<X />
			</Button>
		</div>
	{/snippet}
	{#snippet body()}
		<div class="px-4 pb-4">
			<p class="text-ink-muted">
				Safari on iPhone and iPad installs apps from the Share menu rather than a prompt. Two steps:
			</p>
			<ol class="mt-4 flex flex-col gap-3">
				<li class="flex items-center gap-3">
					<Share size={iconSize} class="text-accent shrink-0" aria-hidden="true" />
					<span>Tap <strong>Share</strong> in the browser toolbar.</span>
				</li>
				<li class="flex items-center gap-3">
					<SquarePlus size={iconSize} class="text-accent shrink-0" aria-hidden="true" />
					<span>Choose <strong>Add to Home Screen</strong>.</span>
				</li>
			</ol>
		</div>
	{/snippet}
</Dialog>
