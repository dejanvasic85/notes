<script lang="ts">
	export let show: boolean;
	let dialog: HTMLDialogElement;
	let innerHeight = 0;
	let visualViewport = 0;

	if (typeof window !== 'undefined') {
		visualViewport = window.innerHeight;
	}

	function handleResize() {
		if (!window.visualViewport) {
			return;
		}

		visualViewport = window.visualViewport.height;
	}

	$: if (dialog && show) {
		dialog.showModal();
	}

	$: if (dialog && !show) {
		dialog.close();
	}
</script>

<svelte:window bind:innerHeight on:resize={handleResize} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close
	on:click|self={() => dialog.close()}
	class="w-full sm:w-3/4 rounded-md fixed top-0 left-0 right-0 bottom-0 mx-auto my-2"
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation class="flex flex-col" style="height: {visualViewport - 50}px">
		<div>
			Header: {innerHeight}, VisualViewport: {visualViewport}
			<slot name="header" />
		</div>
		<div class="flex-1 w-full">
			<slot />
		</div>
		<div>
			<slot name="footer" />
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}

	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.3);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
