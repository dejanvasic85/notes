<script lang="ts">
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

	let transactionCount = $state(0);

	$effect(() => {
		if (!editor) return;

		const handleTransaction = () => {
			transactionCount += 1;
		};

		editor.on('transaction', handleTransaction);
		return () => editor.off('transaction', handleTransaction);
	});

	let activeMarks = $derived.by(() => {
		// Reads transactionCount to register it as a dependency, forcing recompute on every TipTap transaction
		const isTransactionTracked = transactionCount >= 0;
		return {
			bold: isTransactionTracked && (editor?.isActive('bold') ?? false),
			italic: isTransactionTracked && (editor?.isActive('italic') ?? false),
			underline: isTransactionTracked && (editor?.isActive('underline') ?? false)
		};
	});
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
				active={activeMarks[mark]}
				onclick={() => toggle(editor)}
			>
				<Icon size={iconSize} />
			</Button>
		{/each}
	</div>
{/if}
