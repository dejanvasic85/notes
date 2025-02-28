<script lang="ts">
	import { createAvatar, melt } from '@melt-ui/svelte';

	type Props = {
		picture: string;
		name: string;
		size?: 5 | 6 | 7 | 8;
	};

	const { picture, name, size = 5 }: Props = $props();

	const {
		elements: { image }
	} = createAvatar({
		src: picture
	});

	const sizeMap = {
		5: 'size-5',
		6: 'size-6',
		7: 'size-7',
		8: 'size-8'
	};
</script>

<img
	class="m-0 rounded-full ring-2 ring-white {sizeMap[size]}"
	use:melt={$image}
	alt={`Avatar of ${name}`}
/>
