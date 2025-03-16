<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	type Props = {
		initialContent: string;
		onupdate(html: string, plaintext: string): void;
	};

	let { initialContent, onupdate }: Props = $props();
	let element: HTMLDivElement;
	let editor: Editor;

	onMount(() => {
		editor = new Editor({
			autofocus: 'end',
			editable: true,
			editorProps: {
				attributes: {
					class: 'prose h-full p-4 focus:outline-none dark:prose-invert'
				}
			},
			injectCSS: true,
			element: element,
			extensions: [StarterKit],
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

<div class="h-full" bind:this={element}></div>
