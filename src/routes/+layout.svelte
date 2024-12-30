<script lang="ts">
	import './app.css';
	import { setDialogState } from '$lib/state/dialogState.svelte';

	let { children } = $props();
	setDialogState();
</script>

{@render children()}
