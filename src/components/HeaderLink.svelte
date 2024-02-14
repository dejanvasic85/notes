<script lang="ts">
	import { page } from '$app/stores';

	export let label: string;
	export let path: string = '';
	export let type: 'a' | 'button' = 'a';

	const isCurrent = $page.url.pathname === path ? 'page' : undefined;
</script>

{#if type === 'a'}
	<a
		class="rounded-lg px-3 py-2 font-medium hover:bg-slate-100 hover:text-slate-900"
		href={path}
		aria-current={isCurrent}>{label}</a
	>
{:else if type === 'button'}
	<button
		class="rounded-lg px-3 py-2 font-medium hover:bg-slate-100 hover:text-slate-900"
		aria-current={isCurrent}
		on:click>{label}</button
	>
{/if}
