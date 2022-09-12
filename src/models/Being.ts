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
	lastMutation: number;
	isAlive: boolean;
	color: string;
	c_green: number;
	c_red: number;
	c_blue: number;
	c_family: number;
	id: number;
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
		this.health = 900;
		// 1 mineral = 4 health
		this.minerals = 0;
		this.age = 0;
		// iterations since last mutation
		this.lastMutation = 0;
		this.isAlive = true;
		// colors, depends on food
		this.c_red = 0;		// predators
		this.c_green = 255;		// herbivores
		this.c_blue = 0;	//	poison catalysts
		this.c_family = 0;	// family
		this.color = `${this.c_red}, ${this.c_green}, ${this.c_blue}`
		// tech
		this.id = Math.random();
		this.prev = null;
		this.next = null;
	}

	// заполняет память случайным набором команд
	initMemo() {
		this.memory = [20, 1, 40, 0, 43, 0, 43, 35, 35, 35, 43, 41, 42, 33, 67,];
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
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					this.mutate();
					this.incrActivityPointer(1);
					breakFlag = 1;
					break;
				case 16:
					this.fission();
					this.incrActivityPointer(1);
					break;
				case 20:
					this.rotate();
					this.incrActivityPointer(2);
					break;
				case 23:
				case 24:
				case 25:
				case 26:
					this.actWithParam(this.move());
					breakFlag = 1;
					break;
				case 29:
					this.actWithParam(this.swim());
					breakFlag = 1;
					break;
				case 33:
					this.min2Health();
					this.incrActivityPointer(1);
					breakFlag = 1;
					break;
				case 34:
				case 35:
					this.actWithParam(this.eat());
					breakFlag = 1;
					break;
				case 36:
				case 37:
					this.actWithParam(this.giveRes());
					break;
				case 38:
				case 39:
					this.actWithParam(this.mergeRes());
					break;
				case 40:
					this.actWithParam(this.look());
					break;
				case 41:
					this.actWithParam(this.poison2Food());
					breakFlag = 1;
					break;
				case 42:
					this.actWithParam(this.checkHP());
					break;
				case 43:
					this.actWithParam(this.checkMinerals());
					break;
				case 46:
					this.actWithParam(this.isEncirclemented());
					break;
				case 52:
					this.genAttack();
					this.incrActivityPointer(1);
					breakFlag = 1;
					break;
				default:
					this.incrActivityPointer(1);
					break;
			}
			if (breakFlag === 1) break;
		}

		// выход из функции
		// действия перед передачей контроля следующему боту
		if (this.isAlive) {
			this.age = this.age + 1;
			this.lastMutation = this.lastMutation + 1;
			// если накопилось много энергии - дать потомство
			if (this.health > 999) {
				this.fission();
			}
			// молодые тратят 1 энергии на ход, пожилые - 3
			this.health = this.age < 600 ? this.health - 1 : this.health - 3;
			// если энергии не осталось - бот умирает
			if (this.health <= 0) {
				this.becomeOrganic();
				return;
			}
			// после этого возраста есть шанс умереть
			if (this.age > 1000) {
				if (Math.random() < 0.1) {
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
		this.lastMutation = 0;
	}

	// возвращает: 2-пусто / 3-вода / 4-еда / 5-органика / 6-бот / 7-яд
	eat() {
		let direction = this.getParam() % 8;

		//this.health -= 4;
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

		// впереди вода
		if (this.field.cells?.[yt]?.[xt].type === 'water') return 3;

		// если впереди яд
		if (this.field.cells?.[yt]?.[xt].environment.poison) return 7;

		// если там органика
		if (this.field.cells?.[yt]?.[xt].environment.remains) {
			this.field.cells[yt][xt].environment.remains = false;
			this.minerals += 50;
			this.goRed(25);
			return 5;
		}
		// если там еда
		if (this.field.cells?.[yt]?.[xt].environment.food) {
			this.field.cells[yt][xt].environment.food = false;
			let randY = Math.floor(Math.random() * this.field.height);
			let randX = Math.floor(Math.random() * this.field.width);
			this.field.cells[randY][randX].environment.food = true;
			this.health += 100;
			this.goGreen(40);
			return 4;
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
			this.field.cells[target.y][target.x].being = null;
			this.field.bots.removeById(target.id);
			let nrgy = 300 + (target.health / 2);
			this.health += nrgy;
			this.goRed(Math.floor(nrgy / 300));
			return 6;
		}
		// если у жертвы минералов больше
		this.minerals = 0;
		target.minerals -= myMin;

		// если у нас здоровья в 2р. больше, чем минералов у жертвы
		if (this.health >= 2 * target.minerals) {
			target.isAlive = false;
			this.field.cells[target.y][target.x].being = null;
			this.field.bots.removeById(target.id);
			let nrgy = 250 + (target.health / 2) - 2 * target.minerals;
			this.health += Math.min(nrgy, 200);
			this.goRed(Math.floor(nrgy / 300));
			return 6;
		}

		// если здоровья меньше, чем минералов у жертвы * 2, бот погибает от жертвы
		target.minerals -= (this.health / 2);
		this.becomeOrganic();
		return 6;
	}

	// выход: 2-яд не обнаружен / 3-недостаточно минералов / 4-успех
	poison2Food() {
		let direction = this.getParam() % 8;
		let xt = this.xFromVector(direction);
		let yt = this.yFromVector(direction);

		if (!this.field.cells?.[yt]?.[xt].environment.poison) return 2;

		if (this.minerals < 3) return 3;

		this.minerals -= 3;
		this.field.cells[yt][xt].environment.poison = false;
		this.field.cells[yt][xt].environment.food = true;
		let randY = Math.floor(Math.random() * this.field.height);
		let randX = Math.floor(Math.random() * this.field.width);
		this.field.cells[randY][randX].environment.poison = true;
		this.goBlue(25)
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
			this.shiftBot(yt, xt);
			this.becomeOrganic();
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

	min2Health() {
		// максимальное кол-во минералов, которое можно преобразовать
		if (this.minerals > 100) {
			this.minerals -= 100;
			this.health += 400;
			this.goBlue(50);
			// если минералов меньше максимального значения
		} else {
			this.goBlue(this.minerals / 2);
			this.health = this.health + this.minerals * 4;
			this.minerals = 0;
		}
	}

	giveRes() {
		let dir = this.getParam() % 8;
		let xt = this.xFromVector(dir);
		let yt = this.yFromVector(dir);

		if (!this.field.cells?.[yt]?.[xt]) return 1;

		if (
			!this.field.cells[yt][xt].being
			&& !this.field.cells[yt][xt].environment.food
			&& !this.field.cells[yt][xt].environment.poison
			&& !this.field.cells[yt][xt].environment.remains
		) return 2;
		if (!this.field.cells[yt][xt].being) return 3;

		// дошли сюда - впереди живой бот
		// бот отдает четверть здоровья
		let neighbor = this.field.cells[yt][xt].being;
		if (neighbor === null) return 1;

		let myHealth = this.health;
		let myMin = this.minerals;
		this.health -= this.health / 4;
		neighbor.health += myHealth / 4;

		if (this.minerals < 3) return 1;

		this.minerals -= Math.round(this.minerals / 4);
		neighbor.minerals += Math.round(myMin / 4);
		if (neighbor.minerals > 999) neighbor.minerals = 999;
		return 4;
	}

	mergeRes() {
		let dir = this.getParam() % 8;
		let xt = this.xFromVector(dir);
		let yt = this.yFromVector(dir);

		if (!this.field.cells?.[yt]?.[xt]) return 1;

		if (
			!this.field.cells[yt][xt].being
			&& !this.field.cells[yt][xt].environment.food
			&& !this.field.cells[yt][xt].environment.poison
			&& !this.field.cells[yt][xt].environment.remains
		) return 2;

		if (!this.field.cells[yt][xt].being) return 3;

		// дошли сюда - впереди живой бот
		let myHealth = this.health;
		let myMin = this.minerals;
		let neighbor = this.field.cells[yt][xt].being;

		if (neighbor === null) return 1;

		if (myHealth > neighbor.health) {
			const piece = (myHealth - neighbor.health) / 2;
			this.health = this.health - piece;
			neighbor.health = neighbor.health + piece;
		}
		if (myMin > neighbor.minerals) {
			const piece = (myMin - neighbor.minerals) / 2;
			this.minerals = this.minerals - piece;
			neighbor.minerals = neighbor.minerals + piece;
		}
		return 4;
	}

	genAttack() {
		let xt = this.xFromVector(0);
		let yt = this.yFromVector(0);

		if (!this.field.cells?.[yt]?.[xt]) return;

		let neighbor = this.field.cells[yt][xt].being;
		if (!neighbor) return;
		this.health -= 10;
		let genA = Math.floor(Math.random() * this.memoSize);
		let genB = Math.floor(Math.random() * this.memoSize);
		neighbor.memory[genA] = genB;
		genA = Math.floor(Math.random() * this.memoSize);
		genB = Math.floor(Math.random() * this.memoSize);
		neighbor.memory[genB] = genA;
		neighbor.lastMutation = -1;
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

	// выполнить действие в зависимости от обстановки
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
		newBot.color = this.color;

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

	// 
	look() {
		let dir = this.getParam() % 8;
		let xt = this.xFromVector(dir);
		let yt = this.yFromVector(dir);

		if (!this.field.cells?.[yt]?.[xt]) return 3;

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
			return 4;
		}
		if (this.field.cells?.[yt]?.[xt].environment.food) {
			return 5;
		}
		if (this.field.cells?.[yt]?.[xt].environment.remains) {
			return 6;
		}
		if (this.field.cells?.[yt]?.[xt].environment.poison) {
			return 9;
		}
		if (this.isRelative(this.field.cells?.[yt]?.[xt].being)) {
			return 8;
		}
		return 7		// если пред. не сработали, значит там какой-то бот
	}

	checkHP() {
		// берет параметр из генома, возвращает 2, если здоровья больше, иначе - 3
		if (this.health < 1000 * this.getParam() / this.memoSize) return 2;
		return 3;
	}

	checkMinerals() {
		// берет параметр из генома, возвращает 2, если минералов больше, иначе - 3
		if (this.minerals < 1000 * this.getParam() / this.memoSize) return 2;
		return 3;
	}

	// return r, g, b
	getNewColor(parentColor: number) {
		let r, g, b;
		r = this.getRed(parentColor);
		g = this.getGreen(parentColor);
		b = this.getBlue(parentColor);
		const delta = ((20000 / (this.field.age + 1000)) + 20);

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

	goGreen(color: number) {
		this.c_green = this.c_green + color;
		if (this.c_green > 255) this.c_green = 255;
		color = color / 2;
		this.c_red = this.c_red - color;
		if (this.c_red < 0) this.c_red = 0;
		this.c_blue = this.c_blue - color;
		if (this.c_blue < 0) this.c_blue = 0;
		this.color = `${this.c_red}, ${this.c_green}, ${this.c_blue}`;
	}

	goBlue(color: number) {
		this.c_blue = this.c_blue + color;
		if (this.c_blue > 255) this.c_blue = 255;
		color = color / 2;
		this.c_red = this.c_red - color;
		if (this.c_red < 0) this.c_red = 0;
		this.c_green = this.c_green - color;
		if (this.c_green < 0) this.c_green = 0;
		this.color = `${this.c_red}, ${this.c_green}, ${this.c_blue}`;
	}

	goRed(color: number) {
		this.c_red = this.c_red + color;
		if (this.c_red > 255) this.c_red = 255;
		color = color / 2;
		this.c_green = this.c_green - color;
		if (this.c_green < 0) this.c_green = 0;
		this.c_blue = this.c_blue - color;
		if (this.c_blue < 0) this.c_blue = 0;
		this.color = `${this.c_red}, ${this.c_green}, ${this.c_blue}`;
	}
}