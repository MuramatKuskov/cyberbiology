import { Being } from "./Being";
import { Environment } from "./Environment";

export class Cell {
	readonly x: number;
	readonly y: number;
	readonly type: string;
	being: Being | null;
	environment: Environment;
	id: number;

	constructor(x: number, y: number, type: string, being: Being | null, environment: Environment) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.being = being;
		this.environment = environment;
		this.id = Math.random();
	}
}