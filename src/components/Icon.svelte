<script lang="ts">
	export let icon: keyof typeof svgPath;
	export let size: number = 24;
	export let title: string = '';

	const svgPath = {
		chevronLeft: {
			path: 'M13.939 4.939 6.879 12l7.06 7.061 2.122-2.122L11.121 12l4.94-4.939z',
			viewBox: '0 0 24 24'
		},
		check: {
			path: 'M9.86 18a1 1 0 0 1-.73-.32l-4.86-5.17a1 1 0 1 1 1.46-1.37l4.12 4.39 8.41-9.2a1 1 0 1 1 1.48 1.34l-9.14 10a1 1 0 0 1-.73.33z',
			viewBox: '0 0 24 24'
		},
		plus: {
			path: 'M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z',
			viewBox: '0 0 16 16'
		}
	};
</script>

<svg
	viewBox={svgPath[icon].viewBox}
	height={size}
	width={size}
	focusable="false"
	role="img"
	fill="currentColor"><title>{title}</title><path d={svgPath[icon].path} /></svg
>
