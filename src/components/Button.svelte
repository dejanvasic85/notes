<script lang="ts">
	type Variant = 'primary' | 'ghost';

	export let variant: Variant = 'primary';
	export let rounded: boolean | undefined = false;

	const variantClass = {
		primary: 'bg-cyan-700 hover:bg-cyan-600 text-white',
		ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800'
	};

	const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
</script>

<button
	class="{variantClass[
		variant
	]} {roundedClass} p-2 hover:ring-2 text-base min-h-11 min-w-[44px] flex justify-center items-center"
	on:click
>
	<slot />
</button>
