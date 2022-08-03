import { Field } from "./Field";

export class Being {
	field: Field;
	x: number;
	y: number;
	direction: number;
	memoSize: number;
	memory: Array<number>;
	activityPointer: number;
	health: number;
	minerals: number;
	age: number;
	isAlive: boolean;
	color: string;
	c_green: number;
	c_red: number;
	c_blue: number;
	c_family: number;
	id: number;
	ancestors: number;
	prev: Being | null;
	next: Being | null;

	constructor(field: Field, x: number, y: number) {
		// coordinates
		this.field = field;
		this.x = x;
		this.y = y;
		this.direction = Math.floor(Math.random() * 8);
		// genetic
		this.memoSize = 64;
		this.memory = [];
		this.activityPointer = 0;
		// stats
		this.health = 700;
		// из 5 здр можно сделать 1 мин, из 1 мин - 3 здр
		this.minerals = 0;
		this.age = 0;
		this.isAlive = true;
		// colors, depends on food
		this.c_red = 0;		// predators
		this.c_green = 255;		// herbivores
		this.c_blue = 0;	//	poison catalysts
		this.c_family = 0;	// family
		this.color = `${this.c_red}, ${this.c_green}, ${this.c_blue}`
		// tech
		this.id = Math.random();
		this.ancestors = 0;
		this.prev = null;
		this.next = null;
	}

	// заполняет память случайным набором команд
	initMemo() {
		while (this.memory.length < this.memoSize) {
			this.memory.push(Math.floor(Math.random() * this.memoSize))
		}
	}

	// главная функция жизнедеятельности ботов
	// управляет поведением
	performActivity() {
		let breakFlag;
		let command;
		for (let cyc = 0; cyc < 15; cyc++) {
			breakFlag = 0;
			command = this.memory[this.activityPointer];
			switch (command) {
				case 0:
					this.mutate();
					this.incrActivityPointer(1);
					breakFlag = 1;
					break;
				case 16:
					this.fission();
					this.incrActivityPointer(1);
					break;
				case 23:
					this.rotate();
					this.incrActivityPointer(2);
					break;
				case 26:
					this.actWithParam(this.move());
					breakFlag = 1;
					break;
				case 29:
					this.actWithParam(this.swim());
					breakFlag = 1;
					break;
				// case 33:
				// 	this.min2Health();
				// 	this.incrActivityPointer(1);
				// 	breakFlag = 1;
				// 	break;
				case 34:
					this.actWithParam(this.eat());
					breakFlag = 1;
					break;
				// case 36:
				// case 37:
				// 	this.actWithParam(this.give());
				// 	break;
				// case 38:
				// case 39:
				// 	this.actWithParam(this.care());
				// 	break;
				case 41:
					this.actWithParam(this.poison2Food());
					breakFlag = 1;
					break;
				// case 40:
				// 	this.actWithParam(this.look());
				// 	break;
				// case 42:
				// 	this.actWithParam(this.checkHP());
				// 	break;
				// case 43:
				// 	this.actWithParam(this.checkMinerals());
				// 	break;
				case 46:
					this.actWithParam(this.isEncirclemented());
					break;
				// case 47:
				// 	this.actWithParam(this.isHealthIncr());
				// 	break;
				// case 48:
				// 	this.actWithParam(this.isMinIncr());
				// 	break;
				// case 52:
				// 	this.genAttack();
				// 	this.incrActivityPointer(1);
				// 	breakFlag = 1;
				// 	break;
				default:
					this.incrActivityPointer(1);
					break;
			}
			if (breakFlag === 1) break;
		}

		// выход из функции
		// действия перед передачей контроля следующему боту
		if (this.isAlive) {
			// если накопилось много энергии - дать потомство
			if (this.health > 999) {
				this.fission();
			}
			// каждый ход отнимает 3 энергии
			this.health -= 1;
			this.age++;
			// если энергии не осталось - бот умирает
			if (this.health <= 0) {
				this.becomeOrganic();
				return;
			}
			// после этого возраста есть шанс умереть
			if (this.age > 1000) {
				if (Math.random() < 0.05) {
					this.becomeOrganic();
					return;
				}
			}
		}
	}

	mutate() {
		let genA = Math.floor(Math.random() * this.memoSize);
		let genB = Math.floor(Math.random() * this.memoSize);
		this.memory[genA] = genB;
		genA = Math.floor(Math.random() * this.memoSize);
		genB = Math.floor(Math.random() * this.memoSize);
		this.memory[genB] = genA;
	}

	// возвращает: 2-пусто / 3-еда / 4-органика / 5-бот / 6-родня
	eat() {
		let direction = this.getParam() % 8;

		this.health -= 4;
		let xt = this.xFromVector(direction);
		let yt = this.yFromVector(direction);

		// если там пусто
		if (
			!this.field.cells?.[yt]?.[xt].being
			&& !this.field.cells?.[yt]?.[xt].environment.food
			&& !this.field.cells?.[yt]?.[xt].environment.remains
			&& !this.field.cells?.[yt]?.[xt].environment.poison
		) {
			return 2;
		}

		// если впереди яд
		if (this.field.cells?.[yt]?.[xt].environment.poison) {
			return 7;
		}

		// если там органика
		if (this.field.cells?.[yt]?.[xt].environment.remains) {
			this.field.cells[yt][xt].environment.remains = false;
			this.minerals += 4;
			this.getRed(100);
			return 4;
		}
		// если там еда
		if (this.field.cells?.[yt]?.[xt].environment.food) {
			this.field.cells[yt][xt].environment.food = false;
			this.health += 20;
			return 3;
		}

		//-------- дошли сюда, значит впереди бот -----------
		let myMin = this.minerals;
		let target = this.field.cells[yt][xt].being;

		if (!target) return 1;

		// атакуем сперва минералами
		// если у нас их больше
		if (myMin >= target.minerals) {
			this.minerals -= target.minerals;
			target.isAlive = false;
			this.field.bots.removeById(target.id);
			let nrgy = 100 + (target.health / 2)
			this.health += nrgy;
			this.getRed(nrgy);
			this.field.cells[yt][xt].being = null;
		}
		// если у жертвы минералов больше
		this.minerals = 0;
		target.minerals -= myMin;

		// если у нас здоровья в 2р. больше, чем минералов у жертвы
		if (this.health >= 2 * target.minerals) {
			target.isAlive = false;
			this.field.bots.removeById(target.id);
			let nrgy = 100 + (target.health / 2) - 2 * target.minerals;
			this.health += nrgy;
			if (nrgy < 0) nrgy = 0;
			this.getRed(nrgy);
			this.field.cells[yt][xt].being = null;
			return 5;
		}

		// если здоровья меньше, чем минералов у жертвы * 2, бот погибает от жертвы
		target.minerals -= (this.health / 2);
		this.becomeOrganic();
		return 5;
	}

	// выход: 2-яд не обнаружен / 3-недостаточно минералов / 4-успех
	poison2Food() {
		let direction = this.getParam() % 8;
		let xt = this.xFromVector(direction);
		let yt = this.yFromVector(direction);

		if (!this.field.cells?.[yt]?.[xt].environment.poison) return 2;

		if (this.minerals < 4) return 3;

		this.minerals -= 4;
		this.field.cells[yt][xt].environment.poison = false;
		this.field.cells[yt][xt].environment.food = true;
		this.getBlue(100);
		return 4;
	}

	// возвращает: 2-пусто / 3-вода / 4-еда / 5-органика / 6-бот / 7-родня / 8-яд
	move() {
		let dir = this.getParam() % 8;
		let xt = this.xFromVector(dir);
		let yt = this.yFromVector(dir);

		if (!this.field.cells?.[yt]?.[xt]) return 1;

		if (
			!this.field.cells?.[yt]?.[xt].being
			&& !this.field.cells?.[yt]?.[xt].environment.food
			&& !this.field.cells?.[yt]?.[xt].environment.poison
			&& !this.field.cells?.[yt]?.[xt].environment.remains
		) {
			this.shiftBot(yt, xt);
			return 2;
		}
		if (this.field.cells?.[yt]?.[xt].type === 'water') {
			return 3;
		}
		if (this.field.cells?.[yt]?.[xt].environment.food) {
			return 4;
		}
		if (this.field.cells?.[yt]?.[xt].environment.remains) {
			return 5;
		}
		if (this.field.cells?.[yt]?.[xt].environment.poison) {
			return 8;
		}
		if (this.isRelative(this.field.cells?.[yt]?.[xt].being)) {
			return 7;
		}
		return 6		// если пред. не сработали, значит там какой-то бот
	}

	// выход: 2-пусто / 3-там нет воды / 4-там яд / 5-там бот
	swim() {
		let dir = this.getParam() % 8;
		let xt = this.xFromVector(dir);
		let yt = this.yFromVector(dir);

		if (this.field.cells?.[yt]?.[xt].type !== 'water') return 3;
		if (this.field.cells?.[yt]?.[xt].environment.poison) return 4;
		if (this.field.cells?.[yt]?.[xt].being) return 5;
		this.shiftBot(yt, xt);
		return 2
	}

	shiftBot(yt: number, xt: number) {
		this.field.cells[yt][xt].being = this;
		this.field.cells[this.y][this.x].being = null;
		this.x = xt;
		this.y = yt;
	}

	rotate() {
		this.direction = (this.direction - this.getParam()) % 8;
	}

	isRelative(bot: Being | null) {
		if (!bot) return false;
		let rDelta, gDelta, bDelta;
		rDelta = this.getRed(this.c_family) - this.getRed(bot.c_family);
		gDelta = this.getGreen(this.c_family) - this.getGreen(bot.c_family);
		bDelta = this.getBlue(this.c_family) - this.getBlue(bot.c_family);

		let radius2 = rDelta * rDelta + gDelta * gDelta + bDelta * bDelta;

		return (radius2 < 900);   // магическое число - квадрат расстояния между ботами в пространстве цвета
	}

	// возвращает число, следующее за выполняемой командой
	getParam() {
		return this.memory[(this.activityPointer + 1) % this.memoSize];
	}

	xFromVector(n: number) {
		let xt = this.x;
		n = n + this.direction;
		if (n >= 8) n = n - 8;
		if (n === 0 || n === 6 || n === 7) {
			xt--;
			if (xt < 0) xt = this.field.width - 1;
		} else if (n >= 2 && n <= 4) {
			xt++;
			if (xt >= this.field.width) xt = 0;
		}
		return xt;
	}

	yFromVector(n: number) {
		let yt = this.y;
		n = n + this.direction;
		if (n >= 8) n = n - 8;
		if (n <= 2) {
			yt--;
		} else if (n >= 4 && n <= 6) {
			yt++;
		}
		return yt;
	}

	incrActivityPointer(x: number) {
		this.activityPointer = (this.activityPointer + x) % this.memoSize;
	}

	actWithParam(x: number) {
		let mod = this.memory[(this.activityPointer + x) % this.memoSize];
		this.incrActivityPointer(mod);
	}

	// размножение делением
	fission() {
		this.health = this.health - 150;
		if (this.health <= 0) return;

		let n = this.findEmptyDir();
		if (n === 8) {
			this.health = 0;
			this.becomeOrganic();
			return;
		}

		let yt = this.yFromVector(n);
		let xt = this.xFromVector(n);

		const newBot = new Being(this.field, xt, yt);

		this.field.cells[yt][xt].being = newBot;

		newBot.memory = JSON.parse(JSON.stringify(this.memory));
		newBot.health = this.health / 2;
		this.health = this.health / 2;
		newBot.minerals = this.minerals / 2;
		this.minerals = this.minerals / 2;
		newBot.c_green = this.c_green;
		newBot.c_red = this.c_red;
		newBot.c_blue = this.c_blue;
		newBot.c_family = this.c_family;
		newBot.ancestors += 1;
		if (newBot.ancestors > this.field.generation) {
			this.field.generation = newBot.ancestors
		}

		if (Math.random() < 0.25) {
			const ma = Math.floor(Math.random() * this.memoSize);
			const mc = Math.floor(Math.random() * this.memoSize);
			newBot.memory[ma] = mc;
			newBot.c_family = newBot.getNewColor(this.c_family);
		}

		this.field.bots.addToTail(newBot);
		return newBot;
	}

	becomeOrganic() {
		this.isAlive = false;
		this.field.bots.removeById(this.id);
		this.field.cells[this.y][this.x].environment.remains = true;
		this.field.cells[this.y][this.x].being = null;
	}

	// 1-true, 2-false
	isEncirclemented() {
		for (let i = 0; i < 8; i++) {
			let xt = this.xFromVector(i);
			let yt = this.yFromVector(i);
			if ((yt >= 0) && (yt < this.field.height)) {
				if (
					!this.field.cells[yt][xt].being
					&& !this.field.cells[yt][xt].environment.poison
					&& this.field.cells[yt][xt].type !== 'water'
				) return 2;
			}
		}
		return 1;
	}

	// return vector or 8 if no way
	findEmptyDir() {
		for (let i = 0; i < 8; i++) {
			let xt = this.xFromVector(i);
			let yt = this.yFromVector(i);
			if ((yt >= 0) && (yt < this.field.height - 1)) {
				if (
					!this.field.cells[yt][xt].being
					&& !this.field.cells[yt][xt].environment.poison
					&& this.field.cells[yt][xt].type !== 'water'
				) return i;
			}
		}
		return 8;
	}

	getNewColor(parentColor: number) {
		let r, g, b;
		r = this.getRed(parentColor);
		g = this.getGreen(parentColor);
		b = this.getBlue(parentColor);
		// 1 = world.generation
		const delta = ((20000 / (1 + 1000)) + 20);

		return this.getIntColor(this.vc(r + (Math.random() * delta - delta / 2)), this.vc(g + (Math.random() * delta - delta / 2)), this.vc(b + (Math.random() * delta - delta / 2)));
	}

	getIntColor(r: number, g: number, b: number) {
		let a = 255;
		return (a << 24) | (r << 16) | (g << 8) | b;
	}

	getRed(color: number) {
		return (color >> 16) & 0xFF;
	}

	getGreen(color: number) {
		return (color >> 8) & 0xFF;
	}

	getBlue(color: number) {
		return (color) & 0xFF;
	}

	vc(c: number) {
		return c & 0x000000FF;
	}
}