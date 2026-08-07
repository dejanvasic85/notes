<script lang="ts">
	import { createSubscriber } from 'svelte/reactivity';
	import type { Editor } from '@tiptap/core';
	import { Bold, Italic, List, ListChecks, Underline } from '@lucide/svelte';

	import { type Colour } from '$lib/colours';

	import Button from './Button.svelte';
	import ColourPicker from './ColourPicker.svelte';
	import SaveStatus from './SaveStatus.svelte';

	type Props = {
		editor: Editor | null;
		justSaved: boolean;
		oncolourpick: (colour: Colour | null) => void;
	};

	/*
	 * `bold` and friends are marks; `bulletList` and `taskList` are nodes. Both
	 * answer to editor.isActive(), so the toolbar treats them the same.
	 */
	type ToolbarItemName = 'bold' | 'italic' | 'underline' | 'bulletList' | 'taskList';

	let { editor, justSaved, oncolourpick }: Props = $props();

	const iconSize = 20;

	const toolbarItemsValue = [
		{
			name: 'bold' as ToolbarItemName,
			label: 'Bold',
			Icon: Bold,
			toggle: (e: Editor) => e.chain().focus().toggleBold().run()
		},
		{
			name: 'italic' as ToolbarItemName,
			label: 'Italic',
			Icon: Italic,
			toggle: (e: Editor) => e.chain().focus().toggleItalic().run()
		},
		{
			name: 'underline' as ToolbarItemName,
			label: 'Underline',
			Icon: Underline,
			toggle: (e: Editor) => e.chain().focus().toggleUnderline().run()
		},
		{
			name: 'bulletList' as ToolbarItemName,
			label: 'Bullet list',
			Icon: List,
			toggle: (e: Editor) => e.chain().focus().toggleBulletList().run()
		},
		{
			name: 'taskList' as ToolbarItemName,
			label: 'Checklist',
			Icon: ListChecks,
			toggle: (e: Editor) => e.chain().focus().toggleTaskList().run()
		}
	];

	// Re-renders activeItems whenever the editor fires a transaction (e.g. the
	// selection or formatting changes) - TipTap's own events aren't Svelte-reactive.
	class EditorActiveItems {
		#editor: Editor;
		#subscribe: () => void;

		constructor(editor: Editor) {
			this.#editor = editor;
			this.#subscribe = createSubscriber((update) => {
				this.#editor.on('transaction', update);
				return () => this.#editor.off('transaction', update);
			});
		}

		isActive(name: ToolbarItemName) {
			this.#subscribe();
			return this.#editor.isActive(name);
		}
	}

	let activeItems = $derived(editor ? new EditorActiveItems(editor) : null);
</script>

{#if editor}
	<div
		role="toolbar"
		aria-label="Text formatting"
		class="border-line bg-raised shadow-float pointer-events-auto flex items-center gap-1 rounded-full border p-1"
	>
		<ColourPicker onselect={oncolourpick} side="top" />

		<SaveStatus {justSaved} />

		<span class="bg-line mx-1 h-6 w-px shrink-0" aria-hidden="true"></span>

		{#each toolbarItemsValue as { name, label, Icon, toggle } (name)}
			{@const isActive = activeItems?.isActive(name) ?? false}
			<!--
				No tooltip: this is a touch-first surface and bits-ui opens tooltips
				on focus, so every tap would flash one over the pill. `label` still
				gives each icon its accessible name.
			-->
			<Button
				variant={isActive ? 'primary' : 'ghost'}
				rounded
				{label}
				onclick={() => toggle(editor)}
			>
				<Icon size={iconSize} />
			</Button>
		{/each}
	</div>
{/if}
