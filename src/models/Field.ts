import { Being } from "./Being";
import { BotList } from "./BotList";
import { Cell } from "./Cell";
import { Environment } from "./Environment";

export class Field {
	width: number;
	height: number;
	cells: Cell[][] = [];
	bots: BotList = new BotList();
	age: number;

	constructor(width: number, height: number, cells: Cell[][] = [], bots: BotList = new BotList()) {
		this.width = width;
		this.height = height;
		this.cells = cells;
		this.bots = bots;
		this.age = 0;
	}

	public initCells(waterLevel: number, foodLevel: number, poisonLevel: number) {
		for (let i = 0; i < this.height; i++) {
			const row: Cell[] = []
			for (let j = 0; j < this.width; j++) {
				let type;
				let environment = new Environment(false, false);
				if (Math.random() <= waterLevel) {
					type = 'water'
				} else { type = 'ground' }
				if (Math.random() <= poisonLevel) {
					environment.poison = true;
				} else if (Math.random() <= foodLevel) {
					environment.food = true;
				}
				row.push(new Cell(j, i, type, null, environment))
			}
			this.cells.push(row);
		}
	}

	public spawnBots(n: number, botsToCopy: Being[] = []) {
		const chance = n / (this.width * this.height);
		for (let i = 0; this.bots.length < n; i++) {
			let row = i % this.height;
			let cell = i % this.width;
			if (Math.random() <= chance && !this.cells[row][cell].being) {
				const newBot = new Being(this, cell, row);
				this.bots.addToTail(newBot)
				this.cells[row][cell].being = newBot;
				newBot.initMemo();
				if (botsToCopy.length && Math.random() > 0.4) {
					newBot.memory = botsToCopy[i % botsToCopy.length].memory;
				}
			}
		}
	}

	public startSimulation(fastMode: boolean) {
		let currentBot = this.bots.head;
		let simInterval;
		if (fastMode) {
			simInterval = setInterval(() => {
				this.age = this.age + 1;
				while (currentBot) {
					currentBot?.performActivity();
					currentBot = currentBot?.next;
				}
				if (this.bots.length < 6) {
					for (let i = 0; i < this.bots.length; i++) {
						this.bots.longestSurvivors.unshift(this.bots.list[i]);
						this.bots.longestSurvivors = this.bots.longestSurvivors.splice(0, 5);
					}
				}
				currentBot = this.bots.head;
			}, 10);
		} else {
			simInterval = setInterval(() => {
				this.age = this.age + 1;
				currentBot?.performActivity();
				if (this.bots.length < 6) {
					for (let i = 0; i < this.bots.length; i++) {
						this.bots.longestSurvivors.unshift(this.bots.list[i]);
						this.bots.longestSurvivors = this.bots.longestSurvivors.splice(0, 5);
					}
				}
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