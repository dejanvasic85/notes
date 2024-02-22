<script lang="ts">
	let email = '';

	$: console.log(email);
</script>

<div class="container mx-auto max-w-4xl">
	<div class="flex flex-col">
		<label for="email">Email:</label>
		<input bind:value={email} id="email" type="text" class="border" />
	</div>
</div>
