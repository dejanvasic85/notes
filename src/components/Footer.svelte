<script lang="ts">
	type Props = {
		build: string;
	};

	let { build }: Props = $props();
</script>

<footer class="p-4 text-center">
	Made with love using <a
		href="https://kit.svelte.dev"
		target="_blank"
		class="cursor-pointer font-bold underline">svelte</a
	>
	<p>
		Build: {build} | <a href="/privacy" class="font-bold underline">Privacy policy</a> |
		<a href="/terms" class="font-bold underline">Terms of service</a>
	</p>
</footer>
