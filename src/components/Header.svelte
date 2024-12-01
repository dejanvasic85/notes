<script lang="ts">
	type Props = {
		fullWidth?: boolean;
		children: any;
	};

	let { children, fullWidth = false }: Props = $props();
</script>

<header
	class="z-50 h-16 {fullWidth
		? 'w-full'
		: 'container'} mx-auto border-b-2 bg-background p-2 px-4 dark:bg-dark"
>
	{@render children()}
</header>
