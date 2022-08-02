import { Being } from "./Being";

export class BotList {
	head: Being | null;
	tail: Being | null;
	length: number;

	constructor() {
		this.head = null;
		this.tail = null;
		this.length = 0;
	}

	addToHead(bot: Being) {
		const newHead = bot;
		const currentHead = this.head;
		if (currentHead) {
			currentHead.prev = newHead;
			newHead.next = currentHead;
		}
		this.head = newHead;
		if (!this.tail) this.tail = newHead;
		this.length += 1;
	}

	addToTail(bot: Being) {
		const newTail = bot;
		const currentTail = this.tail;
		if (currentTail) {
			currentTail.next = newTail;
			newTail.prev = currentTail;
		}
		this.tail = newTail;
		if (!this.head) this.head = newTail;
		this.length += 1;
	}

	removeHead() {
		const removed = this.head;
		if (!removed) return;
		this.head = removed.next;
		if (this.head) this.head.prev = null;
		if (removed === this.tail) this.removeTail();
		this.length -= 1;
		return removed;
	}

	removeTail() {
		const removed = this.tail;
		if (!removed) return;
		this.tail = removed.prev;
		if (this.tail) this.tail.next = null;
		if (removed === this.head) this.removeHead();
		this.length -= 1;
		return removed;
	}

	removeById(id: number) {
		let botToRemove;
		let currentBot = this.head;
		while (currentBot !== null) {
			if (currentBot.id === id) {
				botToRemove = currentBot;
				break;
			}
			currentBot = currentBot.next;
		}
		if (!botToRemove) return null;
		if (botToRemove === this.head) {
			this.removeHead()
		} else if (botToRemove === this.tail) {
			this.removeTail()
		} else {
			const nextBot = botToRemove.next;
			const prevBot = botToRemove.prev;
			(nextBot !== null) && (nextBot.prev = prevBot);
			(prevBot !== null) && (prevBot.next = nextBot);
			this.length -= 1;
		}
		this.length < 0 && (this.length = 0);
	}
}