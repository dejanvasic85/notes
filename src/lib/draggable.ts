import type { NoteOrdered } from '../types';

export interface DraggableData {
	note: NoteOrdered;
	index: number;
}

export interface DropzoneData {
	dropEffect?: string;
	dragoverClass?: string;
	onDropped?: (data: DraggableData, event: DragEvent) => void;
}

export function draggable(node: HTMLElement, data: DraggableData) {
	let state = data;

	node.draggable = true;
	node.style.cursor = 'grab';

	function onDragStart(event: DragEvent) {
		event.dataTransfer?.setData('text/plain', JSON.stringify(state));
		(event.target as Element).classList.add('dragging');
	}

	function onDragEnd(event: DragEvent) {
		(event.target as Element).classList.remove('dragging');
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

export function dropzone(node: HTMLElement, options: DropzoneData) {
	let state: DropzoneData = {
		dropEffect: 'move',
		dragoverClass: 'droppable',
		...options
	};

	function handleDragEnter(e: DragEvent) {
		(e.target as Element).classList.add(state.dragoverClass!);
	}

	function handleDragLeave(e: DragEvent) {
		(e.target as Element).classList.remove(state.dragoverClass!);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		//e.dataTransfer.dropEffect = state.dropEffect;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		const data = JSON.parse(e.dataTransfer.getData('text/plain'));
		(e.target as Element).classList.remove(state.dragoverClass!);
		state.onDropped?.(data, e);
	}

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		update(options: DropzoneData) {
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
