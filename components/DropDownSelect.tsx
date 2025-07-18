import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type OptionType = { value: string; label: string };

const DropDownSelect = ({
	options,
	onChange,
	placeHolder,
	disabled,
	value,
}: {
	options: OptionType[];
	onChange: (value: string) => void;
	placeHolder: string;
	disabled: boolean;
	value: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		if (!isSearching) {
			if (value) {
				const selectedOption = options.find((option) => option.value === value);
				setInputValue(selectedOption ? selectedOption.label : '');
			} else {
				setInputValue('');
			}
		}
	}, [value, options, isSearching]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
				dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setIsSearching(false);
				if (value) {
					const selectedOption = options.find((option) => option.value === value);
					setInputValue(selectedOption ? selectedOption.label : '');
				} else {
					setInputValue('');
				}
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [value, options]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			const rect = inputRef.current.getBoundingClientRect();
			setDropdownPosition({
				top: rect.bottom + window.scrollY,
				left: rect.left + window.scrollX,
				width: rect.width,
			});
		}
	}, [isOpen]);

	const filteredOptions = isSearching
		? options.filter((option) =>
			option.label.toLowerCase().includes(inputValue.toLowerCase())
		)
		: options;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		setIsSearching(true);
		setIsOpen(true);
	};

	const handleInputClick = () => {
		setIsOpen(true);
		setIsSearching(false);
	};

	const handleOptionClick = (option: OptionType) => {
		onChange(option.value);
		setInputValue(option.label);
		setIsOpen(false);
		setIsSearching(false);
	};

	return (
		<>
			<div className="relative w-full">
				<input
					ref={inputRef}
					type="text"
					disabled={disabled}
					className="w-full input input-bordered"
					value={inputValue}
					onChange={handleInputChange}
					onFocus={handleInputClick}
					onClick={handleInputClick}
					placeholder={placeHolder}
				/>
			</div>
			{isOpen && createPortal(
				<ul
					ref={dropdownRef}
					className="absolute z-[9999] bg-base-100 border rounded shadow-lg max-h-60 overflow-auto"
					style={{
						top: `${dropdownPosition.top}px`,
						left: `${dropdownPosition.left}px`,
						width: `${dropdownPosition.width}px`,
					}}
				>
					{filteredOptions.length > 0 ? (
						filteredOptions.map((option, index) => (
							<li
								key={`${option.value}_${index}`}
								className={`p-2 hover:bg-base-content/40 cursor-pointer ${
									value === option.value ? 'bg-base-content/20' : ''
								}`}
								onClick={() => handleOptionClick(option)}
							>
								{option.label}
							</li>
						))
					) : (
						<li className="p-2 text-gray-500 italic">No results</li>
					)}
				</ul>,
				document.body
			)}
		</>
	);
};

export default DropDownSelect;