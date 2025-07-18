import React, { useEffect, useState } from 'react';
import { DbCompetitor } from '@/types/types';
import {
	addCompetitor,
	deleteCompetitor,
	getCompetitors
} from '@/libs/api/features';
import { CompetitorToInsert } from '@/app/api/features/competitor/database';
import toast from 'react-hot-toast';

// Define Competitor type excluding 'created_at' and 'updated_at'
type Competitor = Omit<DbCompetitor, 'created_at' | 'updated_at'>;

export const Settings: React.FC = () => {
	const handleAddCompetitor = async (newCompetitor: Omit<Competitor, 'id'>): Promise<void> => {
		await addCompetitor(newCompetitor as CompetitorToInsert);
	};

	const fetchCompetitors = async () => {
		return await getCompetitors();
	};

	return (
		<div className="grid grid-cols-1 gap-6 mt-6">
			<DataTable
				title="Competitors"
				columns={[
					{ key: 'name', label: 'Name', type: 'string' },
					{ key: 'gender', label: 'Gender', type: 'string' },
					{ key: 'ibu_id', label: 'IBU ID', type: 'string' },
					{ key: 'is_team', label: 'Is team', type: 'boolean' }
				]}
				handleAddRow={handleAddCompetitor}
				handleDeleteRow={deleteCompetitor}
				fetchRequest={fetchCompetitors}
			/>
		</div>
	);
};

interface Column {
	key: keyof Competitor;
	label: string;
	type: 'string' | 'boolean';
}

interface DataTableProps {
	title: string;
	columns: Column[];
	handleAddRow: (newItem: Omit<Competitor, 'id'>) => Promise<void>;
	handleDeleteRow: (idToDelete: string) => Promise<void>;
	fetchRequest: () => Promise<Competitor[]>;
}

const DataTable: React.FC<DataTableProps> = ({
	title,
	columns,
	handleAddRow,
	handleDeleteRow,
	fetchRequest,
}) => {
	const [data, setData] = useState<Competitor[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20); // You can adjust the page size if needed
	const [sortColumn, setSortColumn] = useState<keyof Competitor | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [searchTerm, setSearchTerm] = useState('');

	const initialNewRow: Partial<Competitor> = { name: '', ibu_id: '', is_team: false };
	const [newRow, setNewRow] = useState<Partial<Competitor>>(initialNewRow);

	const fetchAndSet = async () => {
		const fetchedData = await fetchRequest();
		setData(fetchedData);
	};

	useEffect(() => {
		fetchAndSet();
	}, []);

	const handleAdd = async () => {
		try {
			await handleAddRow(newRow as Omit<Competitor, 'id'>);
			setNewRow(initialNewRow);
			toast.success('Successfully added');
			fetchAndSet();
		} catch (error) {
			toast.error('Could not add');
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await handleDeleteRow(id);
			toast.success('Successfully deleted');
			fetchAndSet();
			// Adjust current page if necessary
			if ((currentPage - 1) * pageSize >= data.length - 1 && currentPage > 1) {
				setCurrentPage(currentPage - 1);
			}
		} catch (e) {
			toast.error('Could not delete');
		}
	};

	const handleInputChange = (key: keyof Competitor, value: string | boolean) => {
		setNewRow({ ...newRow, [key]: value });
	};

	// Handle sorting
	const handleSort = (columnKey: keyof Competitor) => {
		let direction: 'asc' | 'desc' = 'asc';
		if (sortColumn === columnKey && sortDirection === 'asc') {
			direction = 'desc';
		}
		setSortColumn(columnKey);
		setSortDirection(direction);
	};

	// Apply search filter
	const filteredData = data.filter((item) =>
		columns.some((col) => {
			const value = item[col.key];
			if (typeof value === 'boolean') {
				return (value ? 'Yes' : 'No').toLowerCase().includes(searchTerm.toLowerCase());
			}
			return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
		})
	);

	// Apply sorting
	const sortedData = [...filteredData].sort((a, b) => {
		if (sortColumn) {
			const aValue = a[sortColumn];
			const bValue = b[sortColumn];

			if (aValue === bValue) return 0;

			if (sortDirection === 'asc') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		}
		return 0;
	});

	// Calculate total pages
	const totalPages = Math.ceil(sortedData.length / pageSize);

	// Get current page data
	const indexOfLastItem = currentPage * pageSize;
	const indexOfFirstItem = indexOfLastItem - pageSize;
	const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	return (
		<div className="overflow-x-auto bg-base-100 rounded-xl p-4 h-full border border-base-content/10 min-w-0">
			<div className="flex justify-between items-center mb-4">
				<h2 className="font-bold text-2xl">{title}</h2>
				{/* Search Input */}
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setCurrentPage(1); // Reset to first page on search
					}}
					className="input input-bordered w-64"
					placeholder="Search..."
				/>
			</div>
			<table className="table max-lg:table-sm">
				<thead className="text-sm">
					<tr className="!border-base-content/20">
						<th>#</th>
						{columns.map((col) => (
							<th key={col.key} className="cursor-pointer" onClick={() => handleSort(col.key)}>
								{col.label}
								{/* Sort Indicator */}
								{sortColumn === col.key && (
									<span>{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
								)}
							</th>
						))}
						<th>Actions</th>
					</tr>
					<tr className="text-left !border-base-content/0">
						<td></td>
						{columns.map((col) => (
							<td key={col.key}>
								{col.type === 'boolean' ? (
									<select
										value={newRow[col.key] ? 'true' : 'false'}
										onChange={(e) => handleInputChange(col.key, e.target.value === 'true')}
										className="select select-bordered w-full"
									>
										<option value="false">No</option>
										<option value="true">Yes</option>
									</select>
								) : (
									<input
										type="text"
										value={(newRow[col.key] as string) || ''}
										onChange={(e) => handleInputChange(col.key, e.target.value)}
										className="input input-bordered w-full"
										placeholder={`Enter ${col.label}`}
									/>
								)}
							</td>
						))}
						<td>
							<button onClick={handleAdd} className="btn btn-sm w-full">
								Add
							</button>
						</td>
					</tr>
				</thead>
				<tbody>

					{currentData.map((row, index) => (
						<tr key={row.ibu_id} className="text-left !border-base-content/20">
							<td>{indexOfFirstItem + index + 1}</td>
							{columns.map((col) => (
								<td key={col.key}>
									{col.type === 'boolean' ? (row[col.key] ? 'Yes' : 'No') : row[col.key]}
								</td>
							))}
							<td>
								<button
									onClick={() => handleDelete(row.ibu_id)}
									className="btn btn-error btn-sm w-full"
								>
								Delete
								</button>
							</td>
						</tr>
					))}

					{currentData.length === 0 && (
						<tr>
							<td colSpan={columns.length + 2} className="px-4 py-2 text-center">
							No data available.
							</td>
						</tr>
					)}
				</tbody>
			</table>
			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex justify-between items-center mt-4">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						className="btn btn-link"
					>
						Previous
					</button>
					<span>
            Page {currentPage} of {totalPages}
					</span>
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages || totalPages === 0}
						className="btn btn-link"
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
};