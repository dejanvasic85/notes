<script lang="ts">
	import { untrack } from 'svelte';
	import { Editor, Extension } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import HardBreak from '@tiptap/extension-hard-break';
	import { TaskItem, TaskList } from '@tiptap/extension-list';
	import Placeholder from '@tiptap/extension-placeholder';
	import type { Attachment } from 'svelte/attachments';

	type Props = {
		id: string;
		initialContent: string;
		onupdate(html: string, plaintext: string): void;
		oneditorcreate?(editor: Editor): void;
	};

	let { initialContent, id, onupdate, oneditorcreate }: Props = $props();

	const listItemTypes = ['listItem', 'taskItem'];
	const desktopBreakpoint = 1024;
	// The toolbar pill stands about 62px off the bottom of the sheet; the rest
	// is slack so the caret isn't flush against it as you type.
	const caretClearance = 96;

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

	const initEditor: Attachment<HTMLDivElement> = (element) =>
		untrack(() => {
			const viewportWidth = window.innerWidth;

			const editor = new Editor({
				// Only focus on larger screens — autofocusing on mobile summons the
				// keyboard the moment a note opens, before you've asked to type.
				autofocus: viewportWidth < desktopBreakpoint ? false : 'end',
				editable: true,
				editorProps: {
					attributes: {
						/*
						 * min-h-full, not h-full: a fixed height would cap the editable
						 * element and let content taller than the sheet overflow it
						 * uncontained, bypassing the scroll container's bottom padding
						 * that keeps the floating toolbar off the last line.
						 */
						class: 'prose dark:prose-invert min-h-full w-full max-w-none p-4'
					},
					/*
					 * The floating toolbar hovers over the bottom of the editor, so
					 * ProseMirror has to stop scrolling the caret to the very edge or
					 * you end up typing underneath the pill.
					 */
					scrollThreshold: { top: 0, right: 0, bottom: caretClearance, left: 0 },
					scrollMargin: { top: 0, right: 0, bottom: caretClearance, left: 0 }
				},
				injectCSS: true,
				element,
				extensions: [
					StarterKit.configure({
						hardBreak: false // Disable default hard break to use custom one
					}),
					// Custom HardBreak that triggers on Enter instead of Shift+Enter
					HardBreak.extend({
						addKeyboardShortcuts() {
							return {
								Enter: () => {
									/*
									 * Inside a list, Enter has to keep its usual job — split
									 * the item, or lift out of an empty one. Returning false
									 * hands the key to the list keymap instead of swallowing
									 * it, which would make lists impossible to leave.
									 */
									if (listItemTypes.some((type) => this.editor.isActive(type))) {
										return false;
									}

									return this.editor.commands.setHardBreak();
								}
							};
						}
					}),
					ShiftEnterParagraph,
					Placeholder.configure({
						placeholder: 'Write a note ...'
					}),
					TaskList,
					TaskItem.configure({ nested: true })
				],
				content: initialContent,

				onUpdate: ({ editor }) => {
					onupdate(editor.getHTML(), editor.getText());
				}
			});

			oneditorcreate?.(editor);

			return () => {
				editor.destroy();
			};
		});
</script>

<div class="min-h-full" {id} {@attach initEditor}></div>
