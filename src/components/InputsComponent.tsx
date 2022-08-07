import React, { FC } from 'react';

interface InputsProps {
	fastMode: boolean;
	setFastMode: (arg1: boolean) => void;
	restart: () => void;
}

const InputsComponent: FC<InputsProps> = ({ fastMode, setFastMode, restart }) => {
	function handleSpeed() {
		setFastMode(!fastMode)
	}

	return (
		<div className='inputs'>
			<div className='speed'>
				<input
					type="checkbox"
					checked={fastMode}
					onChange={handleSpeed}
				/>
				<label>Fast Mode</label>
			</div>
			<div className='restart'>
				<input
					type="button"
					onClick={restart}
				/>
			</div>
		</div>
	);
};

export default InputsComponent;