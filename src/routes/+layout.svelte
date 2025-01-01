<script lang="ts">
	import './app.css';
	import { setBoardState } from '$lib/state/boardState.svelte';

	let { children } = $props();
	setBoardState();
</script>

{@render children()}
