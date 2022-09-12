import React, { FC } from 'react';
import { Field } from '../models/Field';

interface DesignationsProps {
	worldAge: number;
	iteration: number;
	numBots: number;
	elderPopulations: number[];
}

const DesignationsComponent: FC<DesignationsProps> = ({ worldAge, iteration, numBots, elderPopulations }) => {
	return (
		<div>
			<p>If bots dont move - it's bad genetic, they will extinct soon. You can restart simulation to put them out of their misery</p>
			<div>Alive bots: {numBots}</div>
			<div>World age: {worldAge}</div>
			<div>World iterations: {iteration}</div>
			<div>Most resistant genotype (iterations count from last mutation): {elderPopulations.map(el => <>{el},</>)}</div>
			<div className='designations'>
				<ul className='designations-list'>
					<li className='designations-item'>
						<span
							className='cell being'
							style={{ backgroundColor: "rgb(0, 255, 0)" }}>
						</span>,
						<span
							className='cell being'
							style={{ backgroundColor: "rgb(255, 0, 0)" }}>
						</span>,
						<span
							className='cell being'
							style={{ backgroundColor: "rgb(0, 0, 255)" }}>
						</span>
						<p>- bot (herbivore, predator & poison transformer)</p>
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