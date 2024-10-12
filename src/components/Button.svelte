<script lang="ts">
	type Variant = 'primary' | 'ghost';

	export let variant: Variant = 'primary';
	export let rounded: boolean | undefined = false;
	export let type: 'button' | 'submit' | 'reset' = 'button';

	const variantClass = {
		primary: 'bg-primary hover:bg-primary/90 text-white',
		ghost: 'dark:hover:bg-slate-800'
	};

	const roundedClass = rounded ? 'rounded-full' : 'rounded-lg';
</script>

<button
	{type}
	class="{variantClass[
		variant
	]} {roundedClass}  flex min-h-11 min-w-[44px] items-center justify-center p-2 text-base transition-colors duration-300 hover:ring-2 hover:ring-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/90"
	on:click
>
	<slot />
</button>
