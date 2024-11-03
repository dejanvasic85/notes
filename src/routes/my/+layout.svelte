<script lang="ts">
	import Header from '$components/Header.svelte';
	import HeaderProfileMenu from '$components/HeaderProfileMenu.svelte';

	import logo from '$lib/images/notes-main.png';

	export let data;

	const userPicture = data.userData?.picture;
</script>

<div class="flex flex-col gap-8">
	<Header>
		<nav class="flex w-full items-center justify-between">
			<img src={logo} alt="Notes" class="size-16" />
			{#if userPicture}
				<HeaderProfileMenu {userPicture} />
			{/if}
		</nav>
	</Header>

	<slot />
</div>
