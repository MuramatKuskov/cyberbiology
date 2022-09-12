import React, { FC } from 'react';

interface InputsProps {
	fastMode: boolean;
	setFastMode: (arg1: boolean) => void;
	initialPopulation: number;
	setInitPopulation: (arg1: number) => void;
	mapWidth: number;
	setMapWidth: (arg1: number) => void;
	mapHeight: number;
	setMapHeight: (arg1: number) => void;
	waterLevel: number;
	setWaterLevel: (arg1: number) => void;
	foodLevel: number;
	setFoodLevel: (arg1: number) => void;
	poisonLevel: number;
	setPoisonLevel: (arg1: number) => void;
	restart: () => void;
}

const InputsComponent: FC<InputsProps> = ({
	fastMode,
	setFastMode,
	initialPopulation,
	setInitPopulation,
	mapWidth,
	setMapWidth,
	mapHeight,
	setMapHeight,
	waterLevel,
	setWaterLevel,
	foodLevel,
	setFoodLevel,
	poisonLevel,
	setPoisonLevel,
	restart
}) => {
	return (
		<div className='inputs'>
			<div className='restart'>
				<button
					type='button'
					style={{ minWidth: "50px", minHeight: "20px" }}
					onClick={restart}
				>Restart</button>
			</div>
			<div className='speed'>
				<input
					type="checkbox"
					checked={fastMode}
					onChange={() => setFastMode(!fastMode)}
				/>
				<label>Fast Mode</label>
			</div>
			<div className='quantity-bot'>
				<input
					type="range"
					min={1}
					max={150}
					value={initialPopulation}
					onChange={e => setInitPopulation(+e.target.value)}
				/>
				<label>Initial Population = {initialPopulation}</label>
			</div>
			<div className='map-size'>
				<label>Map width/height</label>
				<input
					id='map-width'
					type="number"
					min={15}
					max={150}
					value={mapWidth}
					onChange={e => setMapWidth(+e.target.value)}
				/>
				<input
					id='map-height'
					type="number"
					min={5}
					max={50}
					value={mapHeight}
					onChange={e => setMapHeight(+e.target.value)}
				/>
			</div>
			<div className='quantity-water'>
				<input
					type="range"
					min={0}
					max={1}
					step={0.05}
					value={waterLevel}
					onChange={e => setWaterLevel(+e.target.value)}
				/>
				<label>Water Level = {waterLevel}</label>
			</div>
			<div className='quantity-food'>
				<input
					type="range"
					min={0}
					max={1}
					step={0.05}
					value={foodLevel}
					onChange={e => setFoodLevel(+e.target.value)}
				/>
				<label>Food = {foodLevel * 100}%</label>
			</div>
			<div className='quantity-poison'>
				<input
					type="range"
					min={0}
					max={1}
					step={0.05}
					value={poisonLevel}
					onChange={e => setPoisonLevel(+e.target.value)}
				/>
				<label>Poison = {poisonLevel * 100}%</label>
			</div>
		</div >
	);
};

export default InputsComponent;