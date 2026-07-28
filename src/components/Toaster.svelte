<script lang="ts">
	import { Toaster as SonnerToaster } from 'svelte-sonner';

	// Clears the sticky 5rem header, plus a 1rem gap, so a top-centre toast
	// never covers the search.
	const toastOffsetValue = { top: '6rem' };
</script>

<SonnerToaster
	position="top-center"
	richColors
	offset={toastOffsetValue}
	mobileOffset={toastOffsetValue}
/>
