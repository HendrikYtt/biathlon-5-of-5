import React from 'react';

const NumberSelect = ({
	value,
	onChange,
	disabled,
	min,
	max
}: {
    value: string | null;
    onChange: (value: string) => void;
	disabled: boolean;
	min: number;
	max: number;
}) => {
	return (
		<div className="form-control w-full">
			<input
				type="number"
				min={min}
				max={max}
				step="1"
				disabled={disabled}
				className="input input-bordered w-full"
				placeholder="Enter a number"
				value={value || ''}
				onChange={(e) => {
					let value = parseInt(e.target.value);
					if (value > max) {
						value = max;
					}
					if (value < min) {
						value = min;
					}
					onChange(value.toString());
				}}
			/>
		</div>
	);
};

export default NumberSelect;
