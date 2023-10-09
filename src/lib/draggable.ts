import type { Note } from '../types';

interface DraggableData {
	note: Note;
	index: number;
}

export function draggable(node: HTMLElement, data: DraggableData) {
	let state = data;

	node.draggable = true;
	node.style.cursor = 'grab';

	function onDragStart(event) {
		event.dataTransfer?.setData('text/plain', JSON.stringify(state));
		event.target?.classList.add('dragging');
	}

	function onDragEnd(event) {
		event.target?.classList.remove('dragging');
	}

	node.addEventListener('dragstart', onDragStart);
	node.addEventListener('dragend', onDragEnd);

	return {
		update() {
			state = data;
		},
		destroy() {
			node.removeEventListener('dragstart', onDragStart);
		}
	};
}

export function dropzone(node: HTMLElement, options?) {
	let state = {
		dropEffect: 'move',
		dragoverClass: 'droppable',
		...options
	};

	function handleDragEnter(e) {
		e.target?.classList.add(state.dragoverClass);
	}

	function handleDragLeave(e) {
		e.target?.classList.remove(state.dragoverClass);
	}

	function handleDragOver(e) {
		e.preventDefault();
		e.dataTransfer.dropEffect = state.dropEffect;
	}

	function handleDrop(e) {
		e.preventDefault();
		const data = JSON.parse(e.dataTransfer.getData('text/plain'));
		e.target.classList.remove(state.dragoverClass);
		state.onDropped(data, e);
	}

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		update(options) {
			state = {
				...state,
				...options
			};
		},
		destroy() {
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
		}
	};
}
