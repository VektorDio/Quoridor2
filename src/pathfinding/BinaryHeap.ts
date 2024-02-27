import Node from "./Node.ts";

export default class NodeHeap {
	heap: Node[] = [];

	// helper functions
	private getLeftChildIndex(parentIndex: number) {
		return 2 * parentIndex + 1;
	}
	private getRightChildIndex(parentIndex: number) {
		return 2 * parentIndex + 2;
	}
	private getParentIndex(childIndex: number) {
		return Math.floor((childIndex - 1) / 2);
	}
	private hasLeftChild(index: number) {
		return this.getLeftChildIndex(index) < this.heap.length;
	}
	private hasRightChild(index: number) {
		return this.getRightChildIndex(index) < this.heap.length;
	}
	private hasParent(index: number) {
		return this.getParentIndex(index) >= 0;
	}
	private getLeftChildValue(index: number) {
		return this.heap[this.getLeftChildIndex(index)].f;
	}
	private getRightChildValue(index: number) {
		return this.heap[this.getRightChildIndex(index)].f;
	}
	private getParentValue(index: number) {
		return this.heap[this.getParentIndex(index)].f;
	}

	// Functions to operate Min Heap

	swap(indexOne: number, indexTwo: number) {
		// const temp = this.heap[indexOne];
		// this.heap[indexOne] = this.heap[indexTwo];
		// this.heap[indexTwo] = temp;
		[this.heap[indexOne], this.heap[indexTwo]] = [this.heap[indexTwo], this.heap[indexOne]]
	}

	peek() {
		if (this.heap.length === 0) {
			return null;
		}
		return this.heap[0];
	}

	// Removing an element will remove the
	// top element with the highest priority then
	// heapifyDown will be called
	remove() {
		if (this.heap.length === 0) {
			return null;
		}
		// eslint-disable-next-line prefer-destructuring
		const item = this.heap[0];
		this.heap[0] = this.heap[this.heap.length - 1];
		this.heap.pop();
		this.heapifyDown();
		return item;
	}

	add(item: Node) {
		this.heap.push(item);
		this.heapifyUp();
	}

	getSize() {
		return this.heap.length
	}

	rescoreElement(node: Node) {
		this.heapifyDown(this.heap.indexOf(node))
	}

	private heapifyUp() {
		let index = this.heap.length - 1;
		while (this.hasParent(index) && this.getParentValue(index) > this.heap[index].f) {
			this.swap(this.getParentIndex(index), index);
			index = this.getParentIndex(index);
		}
	}

	private heapifyDown(startIndex: number = 0) {
		let index = startIndex;
		while (this.hasLeftChild(index)) {
			let smallerChildIndex = this.getLeftChildIndex(index);
			if (this.hasRightChild(index) && this.getRightChildValue(index) < this.getLeftChildValue(index)) {
				smallerChildIndex = this.getRightChildIndex(index);
			}
			if (this.heap[index].f < this.heap[smallerChildIndex].f) {
				break;
			} else {
				this.swap(index, smallerChildIndex);
			}
			index = smallerChildIndex;
		}
	}

	printHeap() {
		console.log(this.heap.map(value => "x:" + value.x + " y:" + value.y));
	}
}