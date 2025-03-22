<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import Icon from '$components/Icon.svelte';
	import { onMount } from 'svelte';
	import Input from './Input.svelte';
	import Button from './Button.svelte';

	let search = $derived(new URL(page.url).searchParams);
	let searchQuery = $derived(search.get('q'));
	let searchValue: string | null = $state(null);

	onMount(() => {
		searchValue = searchQuery;
	});

	function handleTextChange(event: Event) {
		const target = event.target as HTMLInputElement;
		searchValue = target.value;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		goto(`/my/board?q=${searchValue}`);
	}

	function clearAndFocus() {
		const searchInput = document.getElementById('search') as HTMLInputElement;
		searchInput.value = '';
		searchInput.focus();
		goto(`/my/board`);
	}
</script>

<form class="flex flex-grow items-center" onsubmit={handleSubmit}>
	<Input id="search" name="search" onchange={handleTextChange} bind:value={searchValue} />
	<Button variant="ghost" type="reset" onclick={clearAndFocus}>
		<Icon icon="x-mark" fill="none" size={32} />
	</Button>
	<Button variant="ghost" type="submit">
		<Icon icon="search" fill="none" size={32} />
	</Button>
</form>
