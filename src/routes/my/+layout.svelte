<script lang="ts">
	import logo from '$lib/images/notes-main.png';
	import Header from '$components/Header.svelte';
</script>

<div class="flex flex-col gap-8">
	<Header>
		<nav class="flex w-full items-center justify-between">
			<img src={logo} alt="Notes" class="size-16" />
		</nav>
	</Header>
	<slot />
</div>
