import { FC, useEffect, useState } from 'react';
import { Cell } from '../models/Cell';

interface CellProps {
	cell: Cell;
	key: number
}

const CellComponent: FC<CellProps> = ({ cell, key }) => {
	const [being, setBeing] = useState<boolean>(cell.being ? true : false)/* <Being | null>(cell.being) */;

	useEffect(() => {
		const updInt = setInterval(upd, 10);
		return () => {
			clearInterval(updInt);
		}
	}, [])

	function upd() {
		if (cell.being !== null) {
			setBeing(true);
		} else {
			setBeing(false);
		};
	}

	return (
		<div className={[
			'cell',
			cell.type,
			//cell.being && 'being',
			cell.environment.remains && 'organic'
		].join('	')}
			key={key}
			style={cell.being ?
				{ backgroundColor: `rgb(${cell.being?.color})` }
				:
				{}}
		>
			{cell.environment?.food && <div className='food'></div>}
			{cell.environment?.poison && <div className='poison'></div>}
		</div>
	);
};

export default CellComponent;