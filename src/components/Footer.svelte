<script lang="ts">
	import { PUBLIC_BUILD } from '$env/static/public';
</script>

<footer class="p-4 text-center">
	Made with love using <a
		href="https://kit.svelte.dev"
		target="_blank"
		class="cursor-pointer font-bold underline">svelte</a
	>
	<p>
		Build: {PUBLIC_BUILD} | <a href="/privacy" class="font-bold underline">Privacy policy</a> |
		<a href="/terms" class="font-bold underline">Terms of service</a>
	</p>
</footer>
