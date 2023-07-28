<script lang="ts">
	type Variant = 'primary' | 'ghost';

	export let variant: Variant = 'primary';
	export let rounded: boolean | undefined = false;

	const variantClass = {
		primary: 'bg-cyan-700 hover:bg-cyan-600 text-white',
		ghost: 'dark:hover:bg-slate-800'
	};

	const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
</script>

<button
	class="{variantClass[
		variant
	]} {roundedClass} flex min-h-11 min-w-[44px] items-center justify-center p-2 text-base hover:ring-2"
	on:click
>
	<slot />
</button>
