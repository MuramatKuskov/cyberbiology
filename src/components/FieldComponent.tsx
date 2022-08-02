import React, { FC, useEffect } from 'react';
import { Cell } from '../models/Cell';
import CellComponent from './CellComponent';

interface FieldProps {
	cells: Cell[][];
}

const FieldComponent: FC<FieldProps> = ({ cells }) => {
	return (
		<div className='field'>
			{cells.map((row, rowIndex) =>
				<React.Fragment key={rowIndex}>
					{row.map((cell, cellIndex) =>
						<CellComponent
							key={cellIndex}
							cell={cell}
						/>
					)}
				</React.Fragment>
			)}
		</div>
	);
};

export default FieldComponent;