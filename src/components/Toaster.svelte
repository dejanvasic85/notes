<script lang="ts">
	import { slide } from 'svelte/transition';
	import { createToaster, melt } from '@melt-ui/svelte';

	import { getToastMessages } from '$lib/state/toastMessages.svelte';
	import Icon from '$components/Icon.svelte';
	import type { ToastMessage } from '$lib/types';

	const toastMessages = getToastMessages();

	const {
		elements: { content, description, close },
		helpers,
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastMessage>({});

	$effect(() => {
		toastMessages.messages
			.filter((m) => m.isShown === false)
			.forEach((message) => {
				helpers.addToast({ type: 'background', data: message });
				message.isShown = true;
			});
	});
</script>

<div use:portal class="fixed left-1/2 top-2 z-toaster w-80 -translate-x-1/2 transform">
	{#each $toasts as { id, data } (id)}
		<div use:melt={$content(id)}>
			<div
				in:slide={{ duration: 200 }}
				out:slide={{ duration: 200 }}
				class="mb-2 flex items-center justify-between rounded-lg p-4 text-sm shadow-lg"
				class:bg-red-300={data.type === 'error'}
				class:bg-green-300={data.type === 'success'}
			>
				<div use:melt={$description(id)}>
					{data.message}
				</div>
				<button use:melt={$close(id)} aria-label="close notification">
					<Icon icon="x-mark" />
				</button>
			</div>
		</div>
	{/each}
</div>
