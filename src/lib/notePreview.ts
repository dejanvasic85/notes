/*
 * Board cards preview the note as plain text rather than rendering its HTML:
 * a card is too small for headings and lists to read as anything but noise,
 * and its height stays predictable in the masonry columns.
 *
 * textPlain is the source, but it is only as good as the last save — rows
 * written before the editor started storing it can hold an empty string next
 * to real `text`. Falling back to a tag strip keeps those notes readable.
 * The result is rendered as text content, never as HTML.
 */

const tagPattern = /<[^>]*>/g;
const whitespacePattern = /\s+/g;

export function getNotePreview(textPlain: string, text: string): string {
	const plain = textPlain.trim();
	if (plain) {
		return plain;
	}

	return text.replace(tagPattern, ' ').replace(whitespacePattern, ' ').trim();
}
