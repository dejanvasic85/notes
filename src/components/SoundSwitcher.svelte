<script lang="ts">
	import { Switch } from 'bits-ui';

	import { applySoundMuted, playCue, readSoundMuted } from '$lib/sound';

	const labelId = 'sound-preference-label';

	/*
	 * Reads as enabled during SSR — the stored choice only exists in the
	 * browser — then corrects itself on hydration, matching how
	 * ThemeSwitcher handles the same gap.
	 */
	let enabled = $state(!readSoundMuted());

	function handleCheckedChange(checked: boolean) {
		enabled = checked;
		applySoundMuted(!checked);

		// Confirms the change is heard the moment it's turned on; turning off
		// stays silent since that's the whole point of the toggle.
		if (checked) {
			playCue('ready');
		}
	}
</script>

<div class="mt-8 flex w-full flex-col gap-2 lg:w-1/2">
	<h2 id={labelId} class="text-heading">Sound</h2>
	<p class="text-ink-muted text-small">
		Short sound effects for creating, dragging and deleting notes.
	</p>

	<div class="mt-2 flex items-center justify-between gap-4">
		<span class="text-ink" aria-hidden="true">{enabled ? 'On' : 'Off'}</span>
		<Switch.Root
			checked={enabled}
			onCheckedChange={handleCheckedChange}
			aria-labelledby={labelId}
			class="data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=unchecked]:border-line-strong data-[state=unchecked]:bg-paper relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-(--duration-fast) after:absolute after:-inset-3 after:content-['']"
		>
			<Switch.Thumb
				class="bg-ink-muted data-[state=checked]:bg-on-accent block size-4 translate-x-1 rounded-full transition-transform duration-(--duration-fast) data-[state=checked]:translate-x-6"
			/>
		</Switch.Root>
	</div>
</div>
