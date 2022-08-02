import React from 'react';

const DesignationsComponent = () => {
	return (
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
	);
};

export default DesignationsComponent;