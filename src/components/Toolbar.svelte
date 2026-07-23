<script lang="ts">
	import { createSubscriber } from 'svelte/reactivity';
	import type { Editor } from '@tiptap/core';
	import { Bold, Italic, Underline } from '@lucide/svelte';

	import Button from './Button.svelte';

	type Props = {
		editor: Editor | null;
	};

	type MarkName = 'bold' | 'italic' | 'underline';

	let { editor }: Props = $props();

	const iconSize = 16;

	const toolbarItemsValue = [
		{
			mark: 'bold' as MarkName,
			label: 'Bold',
			Icon: Bold,
			toggle: (e: Editor) => e.chain().focus().toggleBold().run()
		},
		{
			mark: 'italic' as MarkName,
			label: 'Italic',
			Icon: Italic,
			toggle: (e: Editor) => e.chain().focus().toggleItalic().run()
		},
		{
			mark: 'underline' as MarkName,
			label: 'Underline',
			Icon: Underline,
			toggle: (e: Editor) => e.chain().focus().toggleUnderline().run()
		}
	];

	// Re-renders activeMarks whenever the editor fires a transaction (e.g. the
	// selection or formatting changes) - TipTap's own events aren't Svelte-reactive.
	class EditorActiveMarks {
		#editor: Editor;
		#subscribe: () => void;

		constructor(editor: Editor) {
			this.#editor = editor;
			this.#subscribe = createSubscriber((update) => {
				this.#editor.on('transaction', update);
				return () => this.#editor.off('transaction', update);
			});
		}

		isActive(mark: MarkName) {
			this.#subscribe();
			return this.#editor.isActive(mark);
		}
	}

	let activeMarks = $derived(editor ? new EditorActiveMarks(editor) : null);
</script>

{#if editor}
	<div
		class="dark:border-dark-border flex gap-2 border-b px-2 pt-2 pb-4"
		role="toolbar"
		aria-label="Text formatting"
	>
		{#each toolbarItemsValue as { mark, label, Icon, toggle }}
			<Button
				variant="ghost"
				size="sm"
				{label}
				active={activeMarks?.isActive(mark) ?? false}
				onclick={() => toggle(editor)}
			>
				<Icon size={iconSize} />
			</Button>
		{/each}
	</div>
{/if}
