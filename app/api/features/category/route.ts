import { NextResponse, NextRequest } from 'next/server';
import {
	CategoryToInsert,
	UpdateCategoryIsActive,
	getCategories,
	insertCategory,
	updateCategoryIsActive
} from '@/app/api/features/category/database';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET(req: NextRequest) {
	try {
		const categories = await getCategories();
		return NextResponse.json(categories);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const categoryToInsert: CategoryToInsert = await req.json();
		const inserted = await insertCategory(categoryToInsert);

		return NextResponse.json(inserted.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const request: UpdateCategoryIsActive = await req.json();
		const updated = await updateCategoryIsActive(request);

		return NextResponse.json(updated.data);
	} catch (e: any) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
