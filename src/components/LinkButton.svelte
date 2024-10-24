<script lang="ts">
	export let href: string;
	export let variant: 'primary' | 'secondary' | 'tertiary';
</script>

<a
	{href}
	class="rounded-lg border-2 border-{variant} px-6 py-3 transition-all duration-300 hover:scale-105 dark:text-white hover:bg-{variant}/90 md:text-lg"
>
	<slot />
</a>
