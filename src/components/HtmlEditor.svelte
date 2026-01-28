<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, Extension } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import HardBreak from '@tiptap/extension-hard-break';
	import Placeholder from '@tiptap/extension-placeholder';

	type Props = {
		id: string;
		initialContent: string;
		onupdate(html: string, plaintext: string): void;
	};

	let { initialContent, id, onupdate }: Props = $props();
	let element: HTMLDivElement;
	let editor: Editor;

	// Custom extension to make Shift+Enter create a new paragraph
	const ShiftEnterParagraph = Extension.create({
		name: 'shiftEnterParagraph',
		addKeyboardShortcuts() {
			return {
				'Shift-Enter': ({ editor }) => {
					return editor.commands.splitBlock();
				}
			};
		}
	});

	onMount(() => {
		const viewportWidth = window.innerWidth;

		editor = new Editor({
			// Only focus on largrer screens
			autofocus: viewportWidth < 1024 ? false : 'end',
			editable: true,
			editorProps: {
				attributes: {
					class: 'prose h-full p-4 focus:outline-hidden dark:prose-invert'
				}
			},
			injectCSS: true,
			element: element,
			extensions: [
				StarterKit.configure({
					hardBreak: false // Disable default hard break to use custom one
				}),
				// Custom HardBreak that triggers on Enter instead of Shift+Enter
				HardBreak.extend({
					addKeyboardShortcuts() {
						return {
							Enter: () => this.editor.commands.setHardBreak()
						};
					}
				}),
				ShiftEnterParagraph,
				Placeholder.configure({
					placeholder: 'Write a note ...'
				})
			],
			content: initialContent,

			onUpdate: ({ editor }) => {
				onupdate(editor.getHTML(), editor.getText());
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div class="h-full" {id} bind:this={element}></div>
