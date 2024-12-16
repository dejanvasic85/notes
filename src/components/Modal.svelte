<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatchOpen = createEventDispatcher();

	export let show: boolean;
	export let className: string = '';

	let dialog: HTMLDialogElement;
	let modalHeight: number | null = 0;

	const getModalHeight = (viewportHeight: number, viewportWidth: number) => {
		return viewportWidth < 1024 ? viewportHeight - 80 : null;
	};

	if (typeof window !== 'undefined') {
		modalHeight = getModalHeight(window.innerHeight, window.innerWidth);
	}

	function handleResize() {
		if (!window.visualViewport) {
			return;
		}

		modalHeight = getModalHeight(window.visualViewport.height, window.visualViewport.width);
	}

	$: if (dialog && show) {
		dialog.showModal();
		dispatchOpen('open');
	}

	$: if (dialog && !show) {
		dialog.close();
	}
</script>

<svelte:window on:resize={handleResize} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close
	on:click|self={() => null}
	class="fixed bottom-0 left-0 right-0 top-0 mx-auto my-4 w-full rounded-md bg-white sm:w-3/4 lg:my-auto lg:w-1/2 dark:bg-dark {className}"
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		on:click|stopPropagation
		class="flex flex-col"
		style="height: {modalHeight ? modalHeight + 'px' : '60vh'}"
	>
		<div>
			<slot name="header" />
		</div>
		<div class="w-full flex-1 overflow-y-auto">
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
		animation: fade 0.3s ease-out;
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
