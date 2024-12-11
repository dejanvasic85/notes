<script lang="ts">
	import Input from '$components/Input.svelte';
	import Button from '$components/Button.svelte';
</script>

<h1 class="text-2xl">Invite friend</h1>
<p>Adding a friend allows you select notes for them to see.</p>

<form>
	<div class="mt-4 flex w-full flex-col gap-2 lg:w-1/2">
		<Input type="text" placeholder="Enter a username" class="flex-1" />
		<Button type="submit">Invite</Button>
	</div>
</form>
