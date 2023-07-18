<script lang="ts">
	type Variant = 'primary' | 'secondary';

	export let variant: Variant | undefined = 'primary';
	export let rounded: boolean | undefined = false;
</script>

<button
	class="bg-cyan-700 p-2 hover:ring-2 hover:bg-cyan-600 text-white {rounded ? `rounded-full` : 'rounded-md'}"
	on:click
>
	<slot />
</button>
