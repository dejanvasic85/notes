<script lang="ts">
	import { withAuth } from '$lib/auth';

	const auth = withAuth();
	$: user = auth.user;
	$: accessToken = auth.accessToken;

	interface Hello {
		hello: string;
	}

	async function getBoard(): Promise<Hello | null> {
		if (!$accessToken) return null;
		const res = await fetch('/api/board', {
			cache: 'no-cache',
			headers: { Authorization: `Bearer ${$accessToken}` }
		});

		if (res.ok) {
			const data = await res.json();
			return data as Hello;
		}
		throw new Error(res.statusText);
	}
</script>

<div>User: {JSON.stringify($user, null, 2)}</div>

{#await getBoard()}
	<p>Loading ...</p>
{:then data}
	<p>{JSON.stringify(data?.hello || {}, null, 2)}</p>
{:catch error}
	<p>{error.message}</p>
{/await}
