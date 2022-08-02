import { Being } from "./Being";
import { BotList } from "./BotList";
import { Cell } from "./Cell";
import { Environment } from "./Environment";

export class Field {
	cells: Cell[][] = [];
	bots: BotList = new BotList();
	width: number;
	height: number;

	constructor(cells: Cell[][] = [], bots: BotList = new BotList()) {
		this.cells = cells;
		this.bots = bots;
		this.width = 0;
		this.height = 0;
	}

	public initCells() {
		for (let i = 0; i < 30; i++) {
			const row: Cell[] = []
			for (let j = 0; j < 50; j++) {
				let type;
				let environment = new Environment(false, false);
				const randomEnvironment = Math.random();
				if (Math.random() <= 0.15) {
					type = 'water'
				} else { type = 'ground' }
				if (randomEnvironment <= 0.2) {
					environment.food = true;
				} else if (randomEnvironment <= 0.3) {
					environment.poison = true;
				}
				row.push(new Cell(j, i, type, null, environment))
				this.width++;
			}
			this.cells.push(row);
			this.height++;
		}
		this.width = this.width / this.height;
	}

	public spawnBots(n: number) {
		const chance = n / 1500 // number of cells
		for (let i = 0; this.bots.length < n; i++) {
			let row = i % 30;
			let cell = i % 50;
			if (Math.random() <= chance) {
				if (!this.cells[row][cell].being) {
					const newBot = new Being(this, cell, row);
					this.bots.addToTail(newBot)
					this.cells[row][cell].being = newBot;
					newBot.initMemo();
				}
			}
		}
	}

	public startSimulation(fastMode: boolean) {
		let currentBot = this.bots.head;
		let simInterval;
		if (fastMode) {
			simInterval = setInterval(() => {
				while (currentBot) {
					currentBot?.performActivity();
					currentBot = currentBot?.next;
				}
				currentBot = this.bots.head;
			}, 10);
		} else {
			simInterval = setInterval(() => {
				currentBot?.performActivity();
				currentBot?.next
					?
					currentBot = currentBot?.next
					:
					currentBot = this.bots.head;
			}, 10);
		}
		return simInterval;
	}
}