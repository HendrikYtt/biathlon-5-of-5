'use client';
import Modal from '@/components/Modal';
import React, {useState} from 'react';
import toast from 'react-hot-toast';
import { useFeatureStore } from '@/libs/stores/categoryStore';
import { addMarket } from '@/libs/api/features';
import { MarketToInsert } from '@/app/api/features/market/database';
import DropDownSelect from '@/components/DropDownSelect';
import {OptionsToChooseFromForUser, Match, optionsToChooseFromForUser} from '@/types/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {marketTypes} from '@/app/api/features/market-type/market-types';

export type SelectedMatchProps = Pick<Match, 'id' | 'gender' | 'is_team'>;
interface ModalProps {
	existingMarketTypeIds: number[];
	isTeam: boolean;
	selectedMatchProps: SelectedMatchProps;
	setSelectedMatchProps: React.Dispatch<React.SetStateAction<SelectedMatchProps>>;
	isModalOpen: boolean;
	setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const marketTypeNameOptions: {value: OptionsToChooseFromForUser, label: OptionsToChooseFromForUser}[] = optionsToChooseFromForUser.map(o => {
	return {
		label: o,
		value: o
	};
});

const schema = z.object({
	name: z.string().min(1, 'Market name is required'),
	options_to_choose_from_for_user: z.enum([...optionsToChooseFromForUser] as [OptionsToChooseFromForUser, ...OptionsToChooseFromForUser[]]),
	market_type_id: z.number().min(1, 'Market type is required'),
});

type FormData = z.infer<typeof schema>;

export const AddNewMarketModal = ({ existingMarketTypeIds, isTeam, selectedMatchProps, setSelectedMatchProps, isModalOpen, setIsModalOpen }: ModalProps) => {
	const { fetchCategories, competitors } = useFeatureStore();
	const [isLoading, setIsLoading] = useState(false);
	const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			options_to_choose_from_for_user: 'PositiveNumber',
			market_type_id: 0,
		}
	});

	const availableMarketTypes = marketTypes
		.filter(mt => {
			return (
				!existingMarketTypeIds.includes(mt.id)
				&& mt.optionsForUser === watch('options_to_choose_from_for_user') as OptionsToChooseFromForUser
				&& mt.isTeam === isTeam
			);
		})
		.map(mt => ({
			label: mt.name,
			value: mt.id.toString()
		}));

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		try {
			const marketData: MarketToInsert = {
				...data,
				match_id: selectedMatchProps.id,
				result: null,
				name: data.name,
				options_to_choose_from_for_user: data.options_to_choose_from_for_user as OptionsToChooseFromForUser,
				market_type_id: Number(data.market_type_id),
			};

			await addMarket(marketData);
			await fetchCategories();
			setIsModalOpen(false);
			setSelectedMatchProps(null);
			toast.success('Market added!');
		} catch (error) {
			toast.error('Failed to add market');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal
			isModalOpen={isModalOpen}
			setIsModalOpen={setIsModalOpen}
			title="Add new question"
			content={
				<form onSubmit={handleSubmit(onSubmit)} className="py-2">
					<div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
						<div className="flex-1">
							<label className="block text-sm font-medium mb-2">
								Market Name
							</label>
							<Controller
								name="name"
								control={control}
								render={({field}) => (
									<input
										{...field}
										type="text"
										className="input input-bordered w-full"
									/>
								)}
							/>
							{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
						</div>
						<div className="flex-1">
							<label className="block text-sm font-medium mb-2">
								User options
							</label>
							<Controller
								name="options_to_choose_from_for_user"
								control={control}
								render={({field}) => (
									<DropDownSelect
										value={field.value}
										disabled={false}
										placeHolder={'Select'}
										options={marketTypeNameOptions}
										onChange={field.onChange}
									/>
								)}
							/>
							{errors.options_to_choose_from_for_user &&
								<p className="text-red-500 text-xs mt-1">{errors.options_to_choose_from_for_user.message}</p>}
						</div>
						<div className="flex-1">
							<label className="block text-sm font-medium mb-2">
								Market Type
							</label>
							<Controller
								name="market_type_id"
								control={control}
								render={({field}) => (
									<DropDownSelect
										value={field.value.toString()}
										disabled={false}
										placeHolder={'Select'}
										options={availableMarketTypes}
										onChange={(value) => field.onChange(parseInt(value))}
									/>
								)}
							/>
							{errors.market_type_id &&
								<p className="text-red-500 text-xs mt-1">{errors.market_type_id.message}</p>}
						</div>
						<div>
							<button
								type="submit"
								className="btn btn-primary mt-4 md:mt-0"
								disabled={isLoading}
							>
								{isLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Add'}
							</button>
						</div>
					</div>
				</form>
			}
		/>
	);
};