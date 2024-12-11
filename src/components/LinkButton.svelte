<script lang="ts">
	export let href: string;
	export let variant: 'primary' | 'secondary' | 'tertiary';
	export let className = '';
</script>

<a
	{href}
	class="flex gap-2 rounded-lg border-2 bg-{variant} border-{variant} px-6 py-3 transition-all duration-300 hover:scale-105 dark:text-white hover:bg-{variant}/90 md:text-lg {className}"
>
	<slot />
</a>
