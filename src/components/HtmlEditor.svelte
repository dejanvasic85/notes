<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';

	type Props = {
		id: string;
		initialContent: string;
		onupdate(html: string, plaintext: string): void;
	};

	let { initialContent, id, onupdate }: Props = $props();
	let element: HTMLDivElement;
	let editor: Editor;

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
				StarterKit,
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
