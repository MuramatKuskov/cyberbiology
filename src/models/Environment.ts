export class Environment {
	food: boolean;
	poison: boolean;
	remains: boolean;

	constructor(food: boolean, poison: boolean, remains: boolean = false) {
		this.food = food;
		this.poison = poison;
		this.remains = remains;
	}
}