<script lang="ts">
	import { onMount } from 'svelte';

	import Skeleton from '$components/Skeleton.svelte';
	import Button from '$components/Button.svelte';
	import { getFriendsState } from '$lib/state/friendsState.svelte';
	import LinkButton from '$components/LinkButton.svelte';

	const numberOfSkeletons = 4;
	const friendsState = getFriendsState();
	let loading = $state(true);
	let loadingError = $state('');

	onMount(() => {
		fetch('/api/friends')
			.then((data) => data.json())
			.then((data) => {
				loading = false;
				friendsState.setState(data.friends, data.pendingSentInvites, data.pendingReceivedInvites);
			})
			.catch((err) => {
				loadingError = err.message;
			});
	});
</script>

<h1 class="text-2xl">Friends</h1>
<p>Connect with your friends to share notes.</p>

{#if loading}
	<div class="mt-16">
		<div class="grid gap-2">
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(numberOfSkeletons) as _, i}
				<div class="h-friend w-full">
					<Skeleton />
				</div>
			{/each}
		</div>
	</div>
{:else if loadingError}
	<p class="text-error" role="alert">There was a problem loading your friends.</p>
	<Button onclick={() => window.location.reload()}>Retry</Button>
{:else}
	<div class="mt-4">
		<LinkButton href="/my/friends/add" variant="secondary">Add friend</LinkButton>
		{JSON.stringify(friendsState.pendingSentInvites)}
	</div>
{/if}
