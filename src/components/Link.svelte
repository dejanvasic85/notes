<script lang="ts">
	export let href: string;

	// primary doesn't really work here because we don't have primary dark text colour
	// before adding primary, think about the design and how it will look like
	export let variant: 'secondary' | 'tertiary' = 'secondary';
</script>

<a
	{href}
	class="dark:text-{variant}Dark dark:border-{variant}Dark rounded-lg border-2 border-{variant} px-6 py-3 text-{variant} transition-colors duration-300 hover:bg-{variant}/90 hover:text-white md:text-lg"
>
	<slot />
</a>
