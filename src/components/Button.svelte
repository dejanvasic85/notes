<script lang="ts">
	type Variant = 'primary' | 'ghost';

	export let variant: Variant = 'primary';
	export let rounded: boolean | undefined = false;

	const variantClass = {
		primary: 'bg-cyan-700 hover:bg-cyan-600 text-white',
		ghost: 'bg-transparent hover:bg-gray-100'
	};

	const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
</script>

<button class=" {variantClass[variant]} {roundedClass} p-2 hover:ring-2 text-base" on:click>
	<slot />
</button>
