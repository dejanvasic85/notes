<script lang="ts">
	import { RadioGroup } from 'bits-ui';
	import { Monitor, Moon, Sun } from '@lucide/svelte';

	import {
		applyThemePreference,
		readThemePreference,
		resolveThemePreference,
		type ThemePreference
	} from '$lib/theme';

	type ThemeOption = {
		value: ThemePreference;
		label: string;
		icon: typeof Monitor;
	};

	const labelId = 'theme-preference-label';
	const iconSize = 20;

	const themeOptionsValue: ThemeOption[] = [
		{ value: 'system', label: 'System', icon: Monitor },
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon }
	];

	/*
	 * Reads as System during SSR — the stored choice only exists in the
	 * browser — then corrects itself on hydration. The theme itself is
	 * already right by then: the pre-paint script in app.html stamped it.
	 */
	let preference = $state<ThemePreference>(readThemePreference());

	function handleValueChange(value: string) {
		preference = resolveThemePreference(value);
		applyThemePreference(preference);
	}
</script>

<div class="mt-8 flex w-full flex-col gap-2 lg:w-1/2">
	<h2 id={labelId} class="text-heading">Theme</h2>
	<p class="text-ink-muted text-small">
		System follows your device. A choice is remembered on this device only.
	</p>

	<RadioGroup.Root
		value={preference}
		onValueChange={handleValueChange}
		orientation="horizontal"
		aria-labelledby={labelId}
		class="border-line bg-paper rounded-control mt-2 inline-flex gap-1 self-start border p-1"
	>
		{#each themeOptionsValue as option (option.value)}
			{@const Icon = option.icon}
			<RadioGroup.Item
				value={option.value}
				class="rounded-chip ease-move flex min-h-11 min-w-11 items-center justify-center gap-2 px-4 py-2 transition-colors duration-(--duration-fast) {preference ===
				option.value
					? 'bg-accent text-on-accent'
					: 'text-ink-muted hover:bg-accent-soft hover:text-accent-strong'}"
			>
				<Icon size={iconSize} />
				{option.label}
			</RadioGroup.Item>
		{/each}
	</RadioGroup.Root>
</div>
