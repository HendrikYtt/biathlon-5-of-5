import {Pool, PoolClient} from 'pg';

console.log('-----------');
console.log(process.env.PGHOST);
console.log(process.env.PGPORT);
console.log(process.env.PGUSER);
console.log(process.env.PGPASSWORD);
console.log(process.env.PGDATABASE);

const dbConf = {
	host: process.env.PGHOST || 'localhost',
	port: parseInt(process.env.PGPORT) || 54322,
	user: process.env.PGUSER || 'postgres',
	password: process.env.PGPASSWORD || 'postgres',
	database: process.env.PGDATABASE || 'postgres',
	// Optional: Additional pool configurations
	max: 20, // maximum number of clients in the pool
	idleTimeoutMillis: 30000, // close idle clients after 30 seconds
	connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
};

const pool = new Pool(dbConf);
const testPool = new Pool({...dbConf, database: 'testing'});

export const doQuery = async (query: string, params?: any[], isTest = false): Promise<any[]> => {
	let client: PoolClient;

	if (isTest) {
		client = await testPool.connect();
	} else {
		client = await pool.connect();
	}

	try {
		const result = await client.query(query, params);
		return result.rows;
	} catch (error) {
		console.error('Database query error:', error);
		throw error;
	} finally {
		client.release();
	}
};
