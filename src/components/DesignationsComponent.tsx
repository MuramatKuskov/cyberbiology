import React, { FC } from 'react';
import { Field } from '../models/Field';

interface DesignationsProps {
	field: Field;
}

const DesignationsComponent: FC<DesignationsProps> = ({ field }) => {
	return (
		<div>
			{<div>Generation {field.generation}</div>}
			<div className='designations'>
				<ul className='designations-list'>
					<li className='designations-item'>
						<span className='cell being'></span>
						<p>- bot</p>
					</li>
					<li className='designations-item'>
						<span className='cell water'></span>
						<p>- water</p>
					</li>
					<li className='designations-item'>
						<span className='cell organic'></span>
						<p>- organic</p>
					</li>
				</ul>
				<ul className='designations-list'>
					<li className='designations-item'>
						<div className='cell'><span className='poison'></span></div>
						<p>- poison</p>
					</li>
					<li className='designations-item'>
						<div className='cell'><span className='food'></span></div>
						<p>- food</p>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default DesignationsComponent;