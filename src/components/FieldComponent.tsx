import { FC } from 'react';
import { Cell } from '../models/Cell';
import CellComponent from './CellComponent';

interface FieldProps {
	cells: Cell[][];
}

const FieldComponent: FC<FieldProps> = ({ cells }) => {
	return (
		<div className='field'>
			{cells.map((row, rowIndex) =>
				<div className='field-row' key={rowIndex}>
					{row.map((cell, cellIndex) =>
						<CellComponent
							key={cellIndex}
							cell={cell}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default FieldComponent;