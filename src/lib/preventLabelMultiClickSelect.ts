const multiClickThreshold = 1;

export function preventLabelMultiClickSelect(node: HTMLElement) {
	function handleMouseDown(event: MouseEvent) {
		if (!event.defaultPrevented && event.detail > multiClickThreshold) {
			event.preventDefault();
		}
	}

	node.addEventListener('mousedown', handleMouseDown);

	return () => node.removeEventListener('mousedown', handleMouseDown);
}
