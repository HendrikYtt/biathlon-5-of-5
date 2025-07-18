import {NextRequest, NextResponse} from 'next/server';
import {deleteCompetitor} from '@/app/api/features/competitor/database';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	const { id } = params;

	if (!id) {
		return NextResponse.json({ error: 'Competitor ibu id is required' }, { status: 400 });
	}

	try {
		const result = await deleteCompetitor(id);

		return NextResponse.json(result.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}