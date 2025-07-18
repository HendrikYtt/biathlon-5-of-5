import {NextRequest, NextResponse} from 'next/server';
import {afterEach, resultTest} from '@/app/api/features/biathlon-results/result/test/service-test';
import fs from 'fs';
import {marketTypes} from '@/app/api/features/market-type/market-types';

export async function POST(req: NextRequest) {
	try {
		const filePath = './marketTypes.json';
		fs.writeFileSync(filePath, JSON.stringify(marketTypes, null, 2));
		const {testCaseName} = await req.json();
		await resultTest(testCaseName);
		return NextResponse.json({message: 'ok'});
	} catch (e: any) {
		console.error(e);
		await afterEach();
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}