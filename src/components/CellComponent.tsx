import React, { FC, useEffect, useState } from 'react';
import { Being } from '../models/Being';
import { Cell } from '../models/Cell';

interface CellProps {
	cell: Cell;
	key: number
}

const CellComponent: FC<CellProps> = ({ cell, key }) => {
	const [being, setBeing] = useState<Being | null>(cell.being);
	const [isAlive, setIsAlive] = useState<boolean>(true);

	useEffect(() => {
		const updInt = setInterval(upd, 10);
		return () => {
			clearInterval(updInt);
		}
	}, [])

	function upd() {
		being && setIsAlive(being?.isAlive);
		setBeing(cell.being);
	}

	return (
		<div className={[
			'cell',
			cell.type,
			//being?.isAlive && 'being',
			cell.environment.remains && 'organic'
		].join('	')}
			key={key}
			style={being?.isAlive ?
				{ backgroundColor: `rgb(${being.color})` }
				:
				{}}
		>
			{cell.environment?.food && <div className='food'></div>}
			{cell.environment?.poison && <div className='poison'></div>}
		</div>
	);
};

export default CellComponent;