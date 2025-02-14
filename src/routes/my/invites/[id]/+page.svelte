<script lang="ts">
	import Icon from '$components/Icon.svelte';
	import LinkButton from '$components/LinkButton.svelte';

	let { data } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-6 text-center">
	<h1 class="text-3xl">
		You and {data.friendName} are now connected
	</h1>
	<div><Icon icon="check-circle" fill="none" title="Connected" size={40} /></div>
	<div>The two of you can collaborate on each others notes.</div>
	{#if data.noteEditor}
		<div>In fact, they have already shared one with you!</div>
		<LinkButton variant="secondary" href={`/my/board?id=${data.noteEditor.noteId}`}
			>View note</LinkButton
		>
	{/if}
</div>
