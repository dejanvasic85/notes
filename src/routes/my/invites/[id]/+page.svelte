<script lang="ts">
	import Icon from '$components/Icon.svelte';

	let { data } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-6 text-center">
	<h1 class="text-3xl">
		You have successfully connected to {data.friendName}.
	</h1>
	<div><Icon icon="check-circle" fill="none" title="Connected" size={40} /></div>
	<p>What does this mean? The two of you can collaborate on each others notes.</p>
</div>
